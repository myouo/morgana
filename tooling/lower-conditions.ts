import {branchExpression,expr,instruction} from 'galbox-sdk/port-kit';
import {i32,parseInstruction} from 'galbox-sdk/protocol';
import type {Instruction} from 'galbox-sdk/protocol';
import {literalArg,requireValue,strictArgs} from './kag.js';
import type {Tag} from './kag.js';
export interface ConditionalStep {readonly control?:Tag;readonly code:readonly Instruction[];}
/** Build-time lowering only. The caller lowers all other source actions first.
 * Both branches remain SDK code; scene-state joins still need the caller's validation. */
export function lowerChapterConditions(steps:readonly ConditionalStep[],namespace:string,end:string):Instruction[]{
 requireValue(/^[a-zA-Z][a-zA-Z0-9_.:/-]{0,79}$/u.test(namespace)&&steps.length<=100000,'CHAPTER_CONDITION_BUDGET');
 const pairs=new Map<number,{otherwise:number|null;end:number}>(),stack:{index:number;otherwise:number|null}[]=[],conditions=new Map<number,ReturnType<typeof expr.equal>>();
 for(const [index,step]of steps.entries()){
  const t=step.control;if(!t)continue;requireValue(!step.code.length,'CHAPTER_CONDITION_CODE');
  if(t.name==='if'){
   strictArgs(t,['exp']);const value=literalArg(t,'exp').replace(/\s/gu,''),match=/^sf\.fataend(==|!=)1$/u.exec(value);requireValue(match,'CHAPTER_CONDITION_UNSUPPORTED '+value);
   conditions.set(index,expr.equal(expr.profile('i32','original.fataend',i32(0)),expr.integer(1),match[1]==='!='));requireValue(stack.length<16,'CHAPTER_CONDITION_DEPTH');stack.push({index,otherwise:null});
  }else if(t.name==='else'){
   strictArgs(t,[]);const top=stack.at(-1);requireValue(top&&top.otherwise===null,'CHAPTER_CONDITION_ELSE');top.otherwise=index;
  }else if(t.name==='endif'){
   strictArgs(t,[]);const top=stack.pop();requireValue(top,'CHAPTER_CONDITION_ENDIF');const pair={otherwise:top.otherwise,end:index};pairs.set(top.index,pair);if(top.otherwise!==null)pairs.set(top.otherwise,pair);
  }else throw new Error('CHAPTER_CONDITION_TAG '+t.name);
 }
 requireValue(!stack.length,'CHAPTER_CONDITION_UNCLOSED');const anchor=(index:number)=>index===steps.length?end:`${namespace}:${index}`,code:Instruction[]=[];
 for(const [index,step]of steps.entries()){
  const at=anchor(index),next=anchor(index+1),tag=step.control;
  if(tag?.name==='if'){const pair=pairs.get(index),condition=conditions.get(index);requireValue(pair&&condition,'CHAPTER_CONDITION_PAIR');code.push(branchExpression(at,condition,next,anchor(pair.otherwise===null?pair.end+1:pair.otherwise+1)));}
  else if(tag?.name==='else'){const pair=pairs.get(index);requireValue(pair,'CHAPTER_CONDITION_PAIR');code.push(instruction('control.jump',{at,target:anchor(pair.end+1)}));}
  else {const body=step.code.map(parseInstruction);code.push(instruction('control.jump',{at,target:body[0]?.at??next}),...body);}
 }
 const ids=code.map(i=>i.at);requireValue(new Set(ids).size===ids.length&&!ids.includes(end),'CHAPTER_CONDITION_ANCHOR');return code;
}
