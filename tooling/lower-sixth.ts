import {readFile} from 'node:fs/promises';
import {interactionPrompt,instruction,variable,literal} from 'galbox-sdk/port-kit';
import type {ProgramBuilder} from 'galbox-sdk/port-kit';
import {bool,string} from 'galbox-sdk/protocol';
import type {DoorIR,DoorToken} from './door-ir.js';
import {readDoorIR} from './door-ir.js';
import {lowerDoor} from './lower-door.js';
import {forkDoor,prepareDoorChoice} from './door-routes.js';
import {sourceChoices,doorSegment,menuIR} from './door-segments.js';
import {chapters} from './chapter-catalog.js';
import {requireValue} from './kag.js';
import type {Content} from './content.js';
import type {Language} from './locale.js';
import {localeInfo} from '../src/locales.js';

/** Parse this finite timer declaration as data. No TJS or general script execution. */
export function sixthStructure(ir:DoorIR){
 const choices=sourceChoices(ir);requireValue(choices.length===1,'SIXTH_SINGLE_CHOICE');const c=choices[0]!;const blocks:string[]=[];let active:string[]|null=null;
 for(const t of ir.tokens){if(t.kind==='tag'&&t.name==='iscript'){requireValue(!active,'SIXTH_SCRIPT_NESTING');active=[];}else if(t.kind==='tag'&&t.name==='endscript'){requireValue(active,'SIXTH_SCRIPT_END');blocks.push(active.join('').replace(/\s/gu,''));active=null;}else if(t.kind==='script'){requireValue(active,'SIXTH_SCRIPT_SCOPE');active.push(t.text);}else requireValue(!active,'SIXTH_SCRIPT_CONTENT');}
 requireValue(!active&&blocks.length===3,'SIXTH_TIMER_BLOCKS');const timer=/^vartimer;timer=newTimer\(onTimer,''\);timer.interval=(\d+);timer.enabled=true;tf.time=0;functiononTimer\(\)\{tf.time\+\+;if\(tf.time>(\d+)\)kag.process\('','\*([^']+)'\);\};$/u.exec(blocks[0]!);requireValue(timer&&timer[1]==='1000'&&timer[2]==='1'&&timer[3]==='否定できない','SIXTH_TIMER_PROFILE');requireValue(blocks.slice(1).every(b=>b==='timer.enabled=false;invalidatetimer;timer=void;'),'SIXTH_TIMER_CLEANUP');
 const clean=(tokens:readonly DoorToken[])=>tokens.filter(t=>t.kind!=='script'&&!(t.kind==='tag'&&(t.name==='iscript'||t.name==='endscript'))),deny=ir.tokens.findIndex(t=>t.kind==='label'&&t.name==='否定する'),timeout=ir.tokens.findIndex(t=>t.kind==='label'&&t.name==='否定できない');requireValue(timeout>=c.end&&deny>timeout,'SIXTH_BRANCH_ORDER');
 const fail=ir.tokens.slice(timeout,deny).filter(t=>t.kind==='tag'&&t.name==='jump');requireValue(fail.length===1&&fail[0]?.kind==='tag'&&fail[0].args.storage==='badend4.ks'&&fail[0].args.target==='*否定できずに','SIXTH_TIMEOUT_DESTINATION');
 const before=doorSegment(ir,0,c.start),good=doorSegment(ir,deny,ir.tokens.length);good.tokens=clean(good.tokens);return {before,good,menu:menuIR(ir,clean(c.tokens)),deadlineMs:Number(timer[1])*(Number(timer[2])+1)};
}
export async function lowerSixth(b:ProgramBuilder,content:Content,locale:Language,source:string,macro:string,fontSize:number){
 const spec=chapters.find(c=>c.id==='scenario6')!,ir=await readDoorIR(source,localeInfo[locale].html,{chapter:spec,catalogRoot:'locales'}),plan=sixthStructure(ir),options={chapter:spec,catalogRoot:'locales' as const,namespace:'door6',segmentAtLabels:true,compactTiming:true,dynamicGeometry:true,proceduralEffects:true,proceduralHeartbeat:true,opacityObject:'text-opacity'};
 b.global({id:'original.sixth-choice',kind:'string',initial:string('')}).global({id:'original.return-title',kind:'bool',initial:bool(false)});
 const opening=await lowerDoor(b,content,locale,source,macro,fontSize,{...options,ir:plan.before,functionNamespace:'sixth-before',instructionNamespace:'sixth-before'}),menu=await prepareDoorChoice(plan.menu,forkDoor(opening.context),content,locale,fontSize,{minimum:1,maximum:1});requireValue(menu.destinations[0]?.target==='否定する'&&!menu.destinations[0].storage,'SIXTH_BUTTON_DESTINATION');
 const good=await lowerDoor(b,content,locale,source,macro,fontSize,{...options,ir:plan.good,context:forkDoor(menu.context),functionNamespace:'sixth-good',instructionNamespace:'sixth-good',successor:{storage:'search2.ks'}}),badSpec=chapters.find(c=>c.id==='badend4')!,badSource=await readFile(`private/text/${locale}/scenario/badend4.ks`,'utf8'),bad=await lowerDoor(b,content,locale,badSource,macro,fontSize,{...options,chapter:badSpec,ir:await readDoorIR(badSource,localeInfo[locale].html,{chapter:badSpec,catalogRoot:'locales'}),context:forkDoor(menu.context),functionNamespace:'ending-four',instructionNamespace:'ending-four',successor:{storage:'first.ks'}});
 const at='door6:decision',option=menu.options[0]!;b.function({id:'sixth-route',entry:opening.code[0]!.at,layout:1,params:[],locals:[],returns:'void',code:[...opening.code,...menu.code,interactionPrompt(at,variable('original.sixth-choice','string'),option.text,[{id:'deny',label:option.text,target:'sixth:deny',rect:{x:option.x*1.6,y:option.y*1.2,width:option.width*1.6,height:option.height*1.2}}],{deadlineMs:plan.deadlineMs,timeout:{id:'silence',target:'sixth:timeout'}}),instruction('control.call',{at:'sixth:deny',function:'sixth-good-route',args:[]}),instruction('control.return',{at:'sixth:good-return'}),instruction('value.set',{at:'sixth:timeout',dest:'original.return-title',value:literal(bool(true))}),instruction('control.call',{at:'sixth:bad-call',function:'sixth-bad-route',args:[]}),instruction('control.return',{at:'sixth:bad-return'})]});
 for(const [id,body]of [['sixth-good-route',good],['sixth-bad-route',bad]]as const)b.function({id,entry:body.code[0]!.at,layout:1,params:[],locals:[],returns:'void',code:[...body.code,instruction('control.return',{at:id+':return'})]});
 return {opening,bodies:[opening,good,bad],menus:[{at,value:menu}],autoAt:opening.autoAt,deadlineMs:plan.deadlineMs,code:[instruction('control.call',{at:'sixth:enter',function:'sixth-route',args:[]})]};
}
