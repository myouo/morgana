import {instruction,literal} from 'galbox-sdk/port-kit';
import type {ProgramBuilder} from 'galbox-sdk/port-kit';
import {bool,string} from 'galbox-sdk/protocol';
import type {Instruction} from 'galbox-sdk/protocol';
import {lowerDoor} from './lower-door.js';
import type {DoorContext} from './lower-door.js';
import {forkDoor,prepareDoorChoice} from './door-routes.js';
import {readDoorIR} from './door-ir.js';
import type {DoorIR} from './door-ir.js';
import {sourceChoices,doorSegment,menuIR} from './door-segments.js';
import {chapters} from './chapter-catalog.js';
import {localeInfo} from '../src/locales.js';
import type {Language} from './locale.js';
import type {Content} from './content.js';
import {requireValue,strictArgs} from './kag.js';
/** Four authored single-option prompts and the final two-ending fork. */
export async function lowerNinth(b:ProgramBuilder,content:Content,locale:Language,source:string,macro:string,fontSize:number){
 const spec=chapters.find(c=>c.id==='scenario9')!,ir=await readDoorIR(source,localeInfo[locale].html,{chapter:spec,catalogRoot:'locales'}),choices=sourceChoices(ir),bodies:Awaited<ReturnType<typeof lowerDoor>>[]=[],menus:{at:string;value:Awaited<ReturnType<typeof prepareDoorChoice>>}[]=[],used=new Set(ir.tokens.filter(t=>['page-start','page-end','label'].includes(t.kind))),code:Instruction[]=[];
 requireValue(choices.length===5,'NINTH_CHOICE_COUNT');b.global({id:'original.ninth-choice',kind:'string',initial:string('')}).global({id:'original.return-title',kind:'bool',initial:bool(false)}).global({id:'original.fromfataend',kind:'bool',initial:bool(false)});
 const label=(name:string)=>{const n=ir.tokens.findIndex(t=>t.kind==='label'&&t.name===name);requireValue(n>=0,'NINTH_LABEL '+name);return n;},part=(a:number,z:number)=>doorSegment(ir,a,z);
 const unknown=(c:DoorContext)=>{const out=forkDoor(c);out.stage.markUnknownAssets();return out;};
 async function lower(input:DoorIR,id:string,c?:DoorContext){input.tokens.forEach(t=>used.add(t));const out=await lowerDoor(b,content,locale,source,macro,fontSize,{chapter:spec,catalogRoot:'locales',namespace:'door9',functionNamespace:id,instructionNamespace:id,ir:input,specializedIR:true,segmentAtLabels:true,compactTiming:true,dynamicGeometry:true,proceduralEffects:true,proceduralHeartbeat:true,opacityObject:'text-opacity',...(c?{context:c}:{})});bodies.push(out);out.context.stage.canonicalizePages();return {out,end:out.context.stage.take()};}
 const opening=await lower(part(0,choices[0]!.start),'ninth-opening');code.push(...opening.out.code,...opening.end);let context:DoorContext=opening.out.context;
 const targets=[['できない1'],['できない2'],['できない3'],['刺し貫く'],['外に出よう','まだ寄るところがある']];
 for(let n=0;n<5;n++){const choice=choices[n]!;choice.tokens.forEach(t=>used.add(t));const value=await prepareDoorChoice(menuIR(ir,choice.tokens),unknown(context),content,locale,fontSize,{minimum:n===4?2:1,maximum:n===4?2:1}),at='door9:choice'+n;requireValue(value.destinations.every((d,k)=>!d.storage&&d.target===targets[n]![k]),'NINTH_CHOICE_TARGETS '+n);menus.push({at,value});code.push(...value.code,instruction('choice',{at,dest:'original.ninth-choice',options:value.options.map((o,k)=>({id:o.id,text:o.text,target:'ninth:branch'+n+'-'+k}))}));const base=unknown(value.context);
  for(const [k,d]of value.destinations.entries()){const a=label(d.target),last=n===4?ir.tokens.findIndex((t,i)=>i>a&&t.kind==='tag'&&t.name==='jump'&&t.args.storage===(k===0?'first.ks':'title.ks')):choices[n+1]!.start;requireValue(last>a,'NINTH_BOUNDARY');const r=await lower(part(a,last),'ninth-option-'+n+'-'+k,unknown(base));code.push(...r.out.code.map((i,j)=>j?i:{...i,at:'ninth:branch'+n+'-'+k}),...r.end);context=r.out.context;if(n===4)code.push(instruction('value.set',{at:'ninth:title'+k,dest:'original.return-title',value:literal(bool(true))}),instruction('control.return',{at:'ninth:return'+k}));}
 }
 for(const t of ir.tokens){if(used.has(t)||t.kind==='text'&&!t.text.trim())continue;requireValue(t.kind==='tag','NINTH_UNCONSUMED');if(t.name==='jump'){strictArgs(t,['storage']);requireValue(['first.ks','title.ks'].includes(t.args.storage??''),'NINTH_UNKNOWN_JUMP');}else if(t.name==='s')strictArgs(t,[]);else throw new Error('NINTH_UNCONSUMED_TAG '+t.name+':'+t.source.line);}
 b.function({id:'ninth-route',entry:code[0]!.at,layout:1,params:[],locals:[],returns:'void',code});return {opening:opening.out,bodies,menus,code:[instruction('control.call',{at:'ninth:enter',function:'ninth-route',args:[]})]};
}
