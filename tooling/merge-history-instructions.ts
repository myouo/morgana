import {canonicalWireJSON,parseFunction} from 'galbox-sdk/protocol';
import type {Function as Fn,Instruction,ModuleHeader} from 'galbox-sdk/protocol';
import {requireValue} from './kag.js';
function resolved(i:Instruction,h:ModuleHeader):unknown{if(i.op!=='text.rich')return i;return {...i,runs:i.runs.map(r=>{if(r.kind!=='text'&&r.kind!=='ruby'||r.styleId===undefined)return r;const style=h.textStyles?.find(s=>s.id===r.styleId)?.style;requireValue(style,'HISTORY_MERGE_STYLE');const {styleId,...rest}=r;return {...rest,style};})};}
const note=(i:Instruction)=>i.op==='text.rich'&&i.completion==='history';
/** Keep established call/return/collection ABI; insert only source-authored notes. */
export function mergeHistoryInstructions(previous:readonly Fn[],donor:readonly Fn[],oldHeader:ModuleHeader,newHeader:ModuleHeader){
 const byId=new Map(donor.map(f=>[f.id,f]));requireValue(previous.length===donor.length,'HISTORY_MERGE_FUNCTION_COUNT');let added=0;const functions=previous.map(old=>{
  const next=byId.get(old.id);requireValue(next,'HISTORY_MERGE_FUNCTION '+old.id);const {entry:oldEntry,code:oldCode,...oldABI}=old,{entry:newEntry,code:newCode,...newABI}=next;requireValue(canonicalWireJSON(oldABI)===canonicalWireJSON(newABI),'HISTORY_MERGE_ABI '+old.id);
  // Earlier normal fourth wrappers deliberately retain their historical return
  // addresses. Their equivalent donor suffix must not undo that repair.
  if(/\/ending-[123]-(?:three|two|last)$/u.test(old.id)){
   requireValue(oldCode.length===newCode.length&&canonicalWireJSON(oldCode.filter(i=>i.op==='control.call'))===canonicalWireJSON(newCode.filter(i=>i.op==='control.call')),'HISTORY_MERGE_ENDING');
   for(const code of [oldCode,newCode]){const rest=code.filter(i=>i.op!=='control.call'),flag=rest.find(i=>i.op==='value.set'),ret=rest.find(i=>i.op==='control.return');requireValue(rest.length===2&&flag?.op==='value.set'&&flag.dest==='original.return-title'&&'literal'in flag.value&&flag.value.literal?.kind==='bool'&&flag.value.literal.value===true&&ret?.op==='control.return'&&code.at(-1)?.op==='control.return','HISTORY_MERGE_ENDING_FLAG');}return parseFunction(old);
  }
  const oldByAt=new Map(oldCode.map(i=>[i.at,i])),pending:Instruction[]=[],before=new Map<string,Instruction[]>(),order:string[]=[];
  for(const i of newCode){const was=oldByAt.get(i.at);if(!was){requireValue(note(i),'HISTORY_MERGE_UNEXPECTED_ADDITION '+i.at);pending.push(i);added++;continue;}order.push(i.at);if(pending.length)before.set(i.at,pending.splice(0));const equal=canonicalWireJSON(resolved(was,oldHeader))===canonicalWireJSON(resolved(i,newHeader));requireValue(equal||was.op==='state.collect'&&i.op==='state.collect'&&canonicalWireJSON({...was,historyLimit:i.historyLimit})===canonicalWireJSON(i),'HISTORY_MERGE_CHANGED '+i.at);}
  requireValue(!pending.length,'HISTORY_MERGE_TRAILING_NOTE');const missing=oldCode.filter(i=>!order.includes(i.at));if(missing.length){requireValue(old.id==='fourth/main'&&missing.length===3,'HISTORY_MERGE_MISSING');const guard=missing.find(i=>i.op==='control.branch'),call=missing.find(i=>i.op==='control.call'),ret=missing.find(i=>i.op==='control.return');requireValue(guard?.op==='control.branch'&&guard.at==='postclear-route:5:guard'&&call?.op==='control.call'&&call.function==='postclear-fourth/main'&&ret?.op==='control.return'&&guard.yes===call.at,'HISTORY_MERGE_GUARD');}
  requireValue(canonicalWireJSON(oldCode.filter(i=>order.includes(i.at)).map(i=>i.at))===canonicalWireJSON(order),'HISTORY_MERGE_ORDER '+old.id);const code=oldCode.flatMap(i=>[...before.get(i.at)??[],i]);
  for(let n=0;n<oldCode.length;n++)if(oldCode[n]?.op==='control.call'){const index=code.findIndex(i=>i.at===oldCode[n]!.at);requireValue(code[index+1]?.at===oldCode[n+1]?.at,'HISTORY_MERGE_CALL_ABI '+oldCode[n]!.at);}
  const leading=before.get(oldEntry),entry=leading?.[0]?.at===newEntry?newEntry:oldEntry;requireValue(oldEntry===newEntry||leading?.some(i=>i.at===newEntry)||missing.some(i=>i.at===oldEntry),'HISTORY_MERGE_ENTRY');return parseFunction({...old,entry,code});
 });requireValue(added>0,'HISTORY_MERGE_EMPTY');return {functions,added};
}
