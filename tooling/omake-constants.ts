import type {DoorIR} from './door-ir.js';
import {requireValue,literalArg,strictArgs} from './kag.js';
/** Source-authored literal false blocks are unreachable; translations and identities remain in PO. */
export function specializeOmake(ir:DoorIR){
 const stack:number[]=[],ranges:{a:number;z:number;line:number;lastLine:number}[]=[];
 for(const [n,t]of ir.tokens.entries())if(t.kind==='tag'){
  if(t.name==='if')stack.push(n);
  else if(t.name==='else'||t.name==='elsif')throw new Error('OMAKE_CONSTANT_ELSE');
  else if(t.name==='endif'){const a=stack.pop();requireValue(a!==undefined,'OMAKE_CONSTANT_ENDIF');const first=ir.tokens[a];requireValue(first?.kind==='tag','OMAKE_CONSTANT_START');if(literalArg(first,'exp').trim()==='false'){strictArgs(first,['exp']);strictArgs(t,[]);ranges.push({a,z:n,line:first.source.line,lastLine:t.source.line});}}
 }
 requireValue(stack.length===0,'OMAKE_CONSTANT_UNCLOSED');const roots=ranges.filter(r=>!ranges.some(p=>p.a<r.a&&p.z>r.z)),excluded=(line:number)=>roots.some(r=>line>=r.line&&line<=r.lastLine),pages=ir.extraction.pages.filter(p=>!excluded(p.source.line)),contexts=new Set(pages.map(p=>p.context)),tokens=ir.tokens.filter((t,n)=>t.kind==='page-start'||t.kind==='page-end'?contexts.has(t.page.context):!roots.some(r=>n>=r.a&&n<=r.z));
 const sourceIssues=roots.map(r=>({code:'SOURCE_CONSTANT_FALSE_BLOCK',asset:'omake.ks:'+r.line,behavior:'The literal false branch is unreachable. Retain its PO translation source; omit runtime nodes for '+ir.extraction.pages.filter(p=>p.source.line>=r.line&&p.source.line<=r.lastLine).length+' pages and report contained tags: '+[...new Set(ir.tokens.slice(r.a+1,r.z).flatMap(t=>t.kind==='tag'?[t.name]:[]))].join(',')+'.'}));
 return {ir:{...ir,tokens,extraction:{...ir.extraction,pages}},sourceIssues};
}
