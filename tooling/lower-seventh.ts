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
export function seventhStructure(ir:DoorIR){
 const choices=sourceChoices(ir);requireValue(choices.length===1,'SEVENTH_SINGLE_CHOICE');const c=choices[0]!;const blocks:string[]=[];let active:string[]|null=null;
 for(const t of ir.tokens){if(t.kind==='tag'&&t.name==='iscript'){requireValue(!active,'SEVENTH_SCRIPT_NESTING');active=[];}else if(t.kind==='tag'&&t.name==='endscript'){requireValue(active,'SEVENTH_SCRIPT_END');blocks.push(active.join('').replace(/\s/gu,''));active=null;}else if(t.kind==='script'){requireValue(active,'SEVENTH_SCRIPT_SCOPE');active.push(t.text);}else requireValue(!active,'SEVENTH_SCRIPT_CONTENT');}
 requireValue(!active&&blocks.length===3,'SEVENTH_TIMER_BLOCKS');const timer=/^vartimer;timer=newTimer\(onTimer,''\);timer.interval=(\d+);timer.enabled=true;tf.time=0;functiononTimer\(\)\{tf.time\+\+;if\(tf.time>(\d+)\)kag.process\('','\*([^']+)'\);\};$/u.exec(blocks[0]!);requireValue(timer&&timer[1]==='1000'&&timer[2]==='2'&&timer[3]==='諦めない','SEVENTH_TIMER_PROFILE');requireValue(blocks.slice(1).every(b=>b==='timer.enabled=false;invalidatetimer;timer=void;'),'SEVENTH_TIMER_CLEANUP');
 const clean=(tokens:readonly DoorToken[])=>tokens.filter(t=>t.kind!=='script'&&!(t.kind==='tag'&&(t.name==='iscript'||t.name==='endscript'))),deny=ir.tokens.findIndex(t=>t.kind==='label'&&t.name==='諦めない'),timeout=ir.tokens.findIndex(t=>t.kind==='label'&&t.name==='諦める');requireValue(timeout>=c.end&&deny>timeout,'SEVENTH_BRANCH_ORDER');
 const fail=ir.tokens.slice(timeout,deny).filter(t=>t.kind==='tag'&&t.name==='jump');requireValue(fail.length===1&&fail[0]?.kind==='tag'&&fail[0].args.storage==='badend5.ks'&&fail[0].args.target==='*諦める','SEVENTH_CLICK_DESTINATION');
 const before=doorSegment(ir,0,c.start),good=doorSegment(ir,deny,ir.tokens.length);good.tokens=clean(good.tokens);return {before,good,menu:menuIR(ir,clean(c.tokens)),deadlineMs:Number(timer[1])*(Number(timer[2])+1)};
}
export async function lowerSeventh(b:ProgramBuilder,content:Content,locale:Language,source:string,macro:string,fontSize:number){
 const spec=chapters.find(c=>c.id==='scenario7')!,ir=await readDoorIR(source,localeInfo[locale].html,{chapter:spec,catalogRoot:'locales'}),plan=seventhStructure(ir),options={chapter:spec,catalogRoot:'locales' as const,namespace:'door7',segmentAtLabels:true,compactTiming:true,dynamicGeometry:true,proceduralEffects:true,proceduralHeartbeat:true,opacityObject:'text-opacity'};
 b.global({id:'original.seventh-choice',kind:'string',initial:string('')}).global({id:'original.return-title',kind:'bool',initial:bool(false)});
 const opening=await lowerDoor(b,content,locale,source,macro,fontSize,{...options,ir:plan.before,functionNamespace:'seventh-before',instructionNamespace:'seventh-before'}),menu=await prepareDoorChoice(plan.menu,forkDoor(opening.context),content,locale,fontSize,{minimum:1,maximum:1});requireValue(menu.destinations[0]?.target==='諦める'&&!menu.destinations[0].storage,'SEVENTH_BUTTON_DESTINATION');
 const good=await lowerDoor(b,content,locale,source,macro,fontSize,{...options,ir:plan.good,context:forkDoor(menu.context),functionNamespace:'seventh-good',instructionNamespace:'seventh-good',successor:{storage:'scenario8.ks',target:'*start'}}),badSpec=chapters.find(c=>c.id==='badend5')!,badSource=await readFile(`private/text/${locale}/scenario/badend5.ks`,'utf8'),bad=await lowerDoor(b,content,locale,badSource,macro,fontSize,{...options,chapter:badSpec,ir:await readDoorIR(badSource,localeInfo[locale].html,{chapter:badSpec,catalogRoot:'locales'}),context:forkDoor(menu.context),functionNamespace:'ending-five',instructionNamespace:'ending-five',successor:{storage:'first.ks'}});
 const at='door7:decision',option=menu.options[0]!;b.function({id:'seventh-route',entry:opening.code[0]!.at,layout:1,params:[],locals:[],returns:'void',code:[...opening.code,...menu.code,interactionPrompt(at,variable('original.seventh-choice','string'),option.text,[{id:'give-up',label:option.text,target:'seventh:give-up',rect:{x:option.x*1.6,y:option.y*1.2,width:option.width*1.6,height:option.height*1.2}}],{deadlineMs:plan.deadlineMs,timeout:{id:'continue',target:'seventh:continue'}}),instruction('value.set',{at:'seventh:give-up',dest:'original.return-title',value:literal(bool(true))}),instruction('value.set',{at:'seventh:restore-qmenu',dest:'original.qmenu',value:literal(bool(true))}),instruction('control.call',{at:'seventh:bad-call',function:'seventh-bad-route',args:[]}),instruction('control.return',{at:'seventh:bad-return'}),instruction('control.call',{at:'seventh:continue',function:'seventh-good-route',args:[]}),instruction('control.return',{at:'seventh:good-return'})]});
 for(const [id,body]of [['seventh-good-route',good],['seventh-bad-route',bad]]as const)b.function({id,entry:body.code[0]!.at,layout:1,params:[],locals:[],returns:'void',code:[...body.code,instruction('control.return',{at:id+':return'})]});
 return {opening,bodies:[opening,good,bad],menus:[{at,value:menu}],autoAt:opening.autoAt,deadlineMs:plan.deadlineMs,code:[instruction('control.call',{at:'seventh:enter',function:'seventh-route',args:[]})]};
}
