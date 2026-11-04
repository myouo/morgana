import {branchExpression,expr,instruction,literal,variable} from 'galbox-sdk/port-kit';
import {bool} from 'galbox-sdk/protocol';
import type {Function as ProgramFunction,Instruction} from 'galbox-sdk/protocol';
import {requireValue} from './kag.js';
export const postclearInterlude='postclear.interlude-complete';
/** Guard callee entries: every original callAt, callee and next instruction stays intact. */
export function postclearRoutes(functions:ProgramFunction[],routes:readonly {at:string;target:string;withInterlude?:boolean}[]){
 const main=functions.find(f=>f.id==='main');requireValue(main,'POSTCLEAR_MAIN');const guarded=new Set<string>();
 for(const [n,route]of routes.entries()){
  const call:Instruction|undefined=main.code.find(i=>i.at===route.at);requireValue(call?.op==='control.call','POSTCLEAR_ROUTE '+route.at);const fn:ProgramFunction|undefined=functions.find(f=>f.id===call.function);requireValue(fn&&!fn.params.length&&fn.returns==='void'&&!guarded.has(fn.id),'POSTCLEAR_CALLEE');guarded.add(fn.id);
  const guard='postclear-route:'+n+':guard',clear='postclear-route:'+n+':clear',index=fn.code.findIndex(i=>i.at===fn.entry),marker=fn.code[index]?.op==='extras.scene',entry=marker?fn.code[index+1]?.at:fn.entry;requireValue(entry,'POSTCLEAR_GUARD_ENTRY');
  const branch=branchExpression(guard,expr.profile('bool','original.fataend',bool(false)),clear,entry),code:Instruction[]=[instruction('control.call',{at:clear,function:route.target,args:[]})];
  if(route.withInterlude)code.push(instruction('value.set',{at:clear+':interlude',dest:postclearInterlude,value:literal(bool(true))}));
  code.push(instruction('control.return',{at:clear+':return'}));if(marker)fn.code.splice(index+1,0,branch);else{fn.entry=guard;code.unshift(branch);}fn.code.push(...code);
  if(route.withInterlude){
   const a=main.code.findIndex(i=>i.at===route.at),z=main.code.findIndex(i=>i.at==='integration:chapter2'),calls=main.code.slice(a+1,z).filter(i=>i.op==='control.call');requireValue(z>a&&calls.length>0&&calls.every(i=>i.op==='control.call'&&i.function.startsWith('interlude1-body-')),'POSTCLEAR_INTERLUDE_CALLS');
   for(const [index,c]of calls.entries()){
    requireValue(c.op==='control.call','POSTCLEAR_INTERLUDE_CALL');const body=functions.find(f=>f.id===c.function);requireValue(body&&!body.params.length&&body.returns==='void','POSTCLEAR_INTERLUDE_BODY');const prefix='postclear-interlude-skip:'+index,oldEntry=body.entry;body.entry=prefix;
    body.code.push(branchExpression(prefix,expr.variable(variable(postclearInterlude,'bool')),prefix+':done',oldEntry),...(index===calls.length-1?[instruction('value.set',{at:prefix+':done',dest:postclearInterlude,value:literal(bool(false))}),instruction('control.return',{at:prefix+':return'})]:[instruction('control.return',{at:prefix+':done'})]));
   }
  }
 }
}
