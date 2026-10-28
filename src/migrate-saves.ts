import {createCore} from 'galbox-sdk/core';
import {parseSnapshot,parseTextState,parseTask,parseValue,canonicalWireJSON,readUnit,isTextComplete,isTextConfirming} from 'galbox-sdk/protocol';
import type {Program,Snapshot,TextState,Profile,DeepReadonly,Task} from 'galbox-sdk/protocol';
export type LegacyEdition='opening32'|'prologue93';
export interface KnownSaveInput {source:DeepReadonly<Program>;target:DeepReadonly<Program>;snapshot:DeepReadonly<Snapshot>;profile:DeepReadonly<Profile>;cancellation:{readonly cancelled:boolean};}
function ensure(value:unknown,why:string):asserts value{if(!value)throw new Error('SAVE_UPGRADE_'+why);}
interface Plan {texts:Map<string,DeepReadonly<TextState>>;cuts:Map<string,DeepReadonly<Snapshot>>;afterText:Map<string,DeepReadonly<Snapshot>>;end:DeepReadonly<Snapshot>|null;}
function cutKey(s:DeepReadonly<Snapshot>):string {const w=s.wait;return w?.kind==='text'?'text:'+s.text?.textId:w?'wait:'+w.at:'ended';}
async function makePlan(target:DeepReadonly<Program>,route:'unselected'|'greeting-0'|'greeting-1'):Promise<Plan>{
 const c=createCore(target),plan:Plan={texts:new Map(),cuts:new Map(),afterText:new Map(),end:null};let input=0,pending:string|null=null;
 for(let steps=0;steps<4096;steps++){
  while(c.run(64)==='yield'){}c.drainEffects();const s=c.view().run;
  if(pending){plan.afterText.set(pending,s);pending=null;}
  if(s.frames.some(f=>f.functionId==='door1')||s.status==='ended'){plan.end=s;return plan;}
  plan.cuts.set(cutKey(s),s);const w=s.wait;ensure(w,'UNSTABLE_TARGET');
  if(w.kind==='choice'){if(w.at==='title:wait')c.accept({type:'choose',prompt:w.prompt,option:'start',inputId:String(++input)});else {ensure(w.at==='prologue:choice-greeting','UNKNOWN_CHOICE');if(route==='unselected')return plan;ensure(w.options.some(o=>o.id===route),'CHOICE_ID');c.accept({type:'choose',prompt:w.prompt,option:route,inputId:String(++input)});}}
  else if(w.kind==='text'){
   const id=s.text?.textId;ensure(id,'TEXT_ID');
   for(let k=0;k<256;k++){const now=c.view().run,nw=now.wait;ensure(nw?.kind==='text'&&now.text?.textId===id,'TEXT_BOUNDARY');if(isTextComplete(now.text)){plan.texts.set(id,now.text);c.accept({type:'advance',prompt:nw.prompt,inputId:String(++input)});pending=id;break;}c.accept({type:isTextConfirming(now.text)?'advance':'reveal',prompt:nw.prompt,inputId:String(++input)});}
   ensure(pending,'TEXT_BUDGET');
  }else if(w.kind==='group'||w.kind==='delay'){
   const ids=w.kind==='delay'?[w.task]:s.groups.find(g=>g.id===w.group)?.members;ensure(ids,'GROUP');const tasks=ids.map(id=>s.tasks.find(t=>t.id===id));ensure(tasks.every(t=>t&&['stage','animation','delay','audio-fade','audio-source-fade','audio-duck'].includes(t.kind)),'UNPROVEN_MEDIA_WAIT');c.accept({type:'tick',ms:Math.max(0,...tasks.map(t=>Math.max(0,t!.duration-t!.elapsed)))});
  }else throw new Error('SAVE_UPGRADE_UNSUPPORTED_WAIT '+w.kind);
  if(steps%24===0)await new Promise<void>(resolve=>setTimeout(resolve,0));
 }
 throw new Error('SAVE_UPGRADE_EXECUTION_BUDGET');
}
function timeline(text:DeepReadonly<TextState>):string {let offset=0;const parts=[];for(const r of text.rich?.runs??[]){if(r.kind==='text'||r.kind==='ruby')offset+=r.content.length;else if(r.kind==='break')offset++;else parts.push({offset,control:r});}return canonicalWireJSON(parts);}
function copyText(old:DeepReadonly<TextState>,template:DeepReadonly<TextState>):TextState {
 ensure(old.content===template.content&&old.speaker===template.speaker&&!!old.rich===!!template.rich&&timeline(old)===timeline(template),'TEXT_CHANGED '+old.textId);
 const text=parseTextState(template);text.prompt=old.prompt;text.revealed=old.revealed;if(old.historyId)text.historyId=old.historyId;else delete text.historyId;
 if(old.rich&&text.rich){ensure(old.rich.segmentation===text.rich.segmentation,'SEGMENTATION');const {at,signature,runs}=text.rich;text.rich={...parseTextState(old).rich!,at,signature,runs};}
 ensure(!old.voice,'VOICE_UNSUPPORTED');return text;
}
/** Source-specific migration, using the production Core to rebuild the destination.
 * It never invents a greeting, reports natural media completion, or rewrites a slot. */
export function knownSaveMapper(edition:LegacyEdition){
 const plans=new Map<string,Promise<Plan>>();
 return async(input:KnownSaveInput):Promise<{snapshot:Snapshot;readAliases:{from:string;to:string}[]}>=>{
  const old=input.snapshot;ensure(!input.cancellation.cancelled,'CANCELLED');ensure(old.saveAllowed&&old.frames.length===1&&old.frames[0]?.functionId==='main'&&old.status!=='running'&&old.status!=='failed','SOURCE_CUT');
  const choice=old.globals['title-action'];ensure(choice?.kind==='string'&&['start','greeting-0','greeting-1'].includes(choice.value),'SOURCE_CHOICE');const route=choice.value==='start'?'unselected':choice.value==='greeting-0'?'greeting-0':'greeting-1',key=input.target.release+':'+route;
  let pending=plans.get(key);if(!pending){pending=makePlan(input.target,route);plans.set(key,pending);void pending.catch(()=>{if(plans.get(key)===pending)plans.delete(key);});}const plan=await pending;ensure(!input.cancellation.cancelled,'CANCELLED');
  const last=old.history.at(-1)?.textId??old.text?.textId,base=old.status==='ended'?(edition==='opening32'&&last?plan.afterText.get(last):plan.end):plan.cuts.get(cutKey(old));ensure(base,'CUT_UNMAPPED '+cutKey(old));const output=parseSnapshot(base),aliases:{from:string;to:string}[]=[],history=new Map<number,TextState>();
  for(const text of old.history){const template=plan.texts.get(text.textId);ensure(template,'HISTORY_UNMAPPED '+text.textId);const mapped=copyText(text,template);ensure(isTextComplete(mapped),'HISTORY_PARTIAL');history.set(text.prompt,mapped);aliases.push({from:readUnit(text),to:readUnit(mapped)});}
  output.history=[...history.values()];output.profileBasis=old.profileBasis;output.counter=Math.max(output.counter,old.counter);output.logicalTime=Math.max(output.logicalTime,old.logicalTime);
  for(const [id,value]of Object.entries(old.globals)){ensure(output.globals[id]?.kind===value.kind,'GLOBAL_ABI '+id);output.globals[id]=parseValue(value);}
  if(output.text){if(old.text?.textId===output.text.textId){output.text=history.get(old.text.prompt)??copyText(old.text,output.text);if(output.wait?.kind==='text')output.wait.prompt=output.text.prompt;}else if(output.wait?.kind==='text'){output.text.prompt=++output.counter;output.wait.prompt=output.text.prompt;}}
  if(output.textLayout)for(const window of output.textLayout.windows)window.entries=window.entries.flatMap(t=>{const oldEntry=old.history.find(h=>h.textId===t.textId);return oldEntry&&history.has(oldEntry.prompt)?[parseTextState(history.get(oldEntry.prompt)!)]:[];});
  if(old.status!=='ended'){
   const assets=new Map<string,string>();for(const a of input.source.assets){const next=input.target.assets.find(b=>b.id===a.id&&b.kind===a.kind&&b.sha256===a.sha256)??input.target.assets.find(b=>b.kind===a.kind&&b.sha256===a.sha256&&b.playback===a.playback);if(next)assets.set(a.id,next.id);}
   const asset=(id:string)=>{const found=assets.get(id);ensure(found,'ASSET_UNMAPPED '+id);return found;};
   const owned=parseSnapshot(old);output.stage=owned.stage;for(const object of output.stage){object.asset=asset(object.asset);for(const layer of object.layers??[])layer.asset=asset(layer.asset);if(object.ruleTransition){object.ruleTransition.from=asset(object.ruleTransition.from);object.ruleTransition.rule=asset(object.ruleTransition.rule);}}
   if(old.scene)output.scene=parseSnapshot(old).scene!;
   const ids=new Map<string,string>();for(const task of output.tasks){const prior=[...old.tasks].reverse().find(t=>t.name===task.name&&t.kind===task.kind);ids.set(task.id,prior?.id??`task:${++output.counter}`);}
   output.tasks=output.tasks.map(task=>{const prior=[...old.tasks].reverse().find(t=>t.name===task.name&&t.kind===task.kind);let value:Task={...task};if(prior){const preserveStop=edition==='opening32'&&task.name==='op-music'&&task.status==='cancelled';if(!preserveStop){value=parseTask(prior);value.id=task.id;value.name=task.name;if(task.at!==undefined)value.at=task.at;else delete value.at;if(value.asset)value.asset=asset(value.asset);if(value.sourceFade&&task.sourceFade){const before=input.source.functions.flatMap(f=>f.code).find(i=>i.at===prior.at),after=input.target.functions.flatMap(f=>f.code).find(i=>i.at===task.at);ensure(before?.op==='audio.source.fade'&&after?.op==='audio.source.fade','FADE_INVOCATION');const normalize=(i:typeof before)=>{const {at:_at,policy:_policy,inactive:_inactive,...abi}=i;return abi;};ensure(canonicalWireJSON(normalize(before))===canonicalWireJSON(normalize(after))&&prior.duration===task.duration,'FADE_INVOCATION_CHANGED');ensure(old.tasks.filter(t=>t.sourceFade?.source===prior.sourceFade?.source&&t.status==='running').length<=1,'FADE_CONFLICT');value.sourceFade.signature=task.sourceFade.signature;}if(value.stageTask&&task.stageTask){value.stageTask.signature=task.stageTask.signature;if(value.stageTask.type==='transition'){for(const layer of value.stageTask.from)layer.asset=asset(layer.asset);value.stageTask.to=asset(value.stageTask.to);}if(value.stageTask.type==='rule'){value.stageTask.from=asset(value.stageTask.from);value.stageTask.to=asset(value.stageTask.to);value.stageTask.rule=asset(value.stageTask.rule);}}}}
    const oldId=task.id;value.id=ids.get(oldId)!;if(value.sourceFade&&!prior)value.sourceFade.source=ids.get(value.sourceFade.source)??value.sourceFade.source;return value;});
   const taskIds=new Set(output.tasks.map(t=>t.id));for(const task of output.tasks)if(task.sourceFade)ensure(taskIds.has(task.sourceFade.source),'FADE_REFERENCE');
   if(old.audioState)output.audioState=parseSnapshot(old).audioState!;
   // The old 32-page excerpt faded the entire BGM bus; the corrected source stops only OP.
   if(edition==='opening32'&&output.audioState){const legacy=old.tasks.find(t=>t.kind==='audio-fade'&&t.at==='awakening:music-fade'),fade=output.tasks.find(t=>t.sourceFade&&t.at==='awakening:music-fade');if(legacy&&fade?.sourceFade){fade.elapsed=legacy.elapsed;const source=output.tasks.find(t=>t.id===fade.sourceFade?.source);ensure(source,'LEGACY_FADE_SOURCE');source.gain=fade.sourceFade.from+(fade.sourceFade.to-fade.sourceFade.from)*fade.elapsed/fade.duration;}if(legacy)output.audioState.gains.bgm=1;}
   if(output.wait?.kind==='delay')output.wait.task=ids.get(output.wait.task)!;
   output.groups=output.groups.filter(g=>!g.consumed).map(g=>({...g,members:g.members.map(id=>ids.get(id)!)}));if(output.wait?.kind==='group'&&old.wait?.kind==='group'){const group=output.groups.find(g=>g.id===(output.wait?.kind==='group'?output.wait.group:''));ensure(group,'GROUP_REMAP');group.id=old.wait.group;output.wait.group=group.id;}
  }
  ensure(!input.cancellation.cancelled,'CANCELLED');return {snapshot:parseSnapshot(output),readAliases:[...new Map(aliases.map(a=>[a.from,a])).values()]};
 };
}
