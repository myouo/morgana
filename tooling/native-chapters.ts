import {instruction,branchExpression,expr,variable,literal,audioFade} from 'galbox-sdk/port-kit';
import type {ProgramBuilder} from 'galbox-sdk/port-kit';
import {bool,string} from 'galbox-sdk/protocol';
import type {Instruction,Function as ProgramFunction} from 'galbox-sdk/protocol';
import {tokenize,requireValue,literalArg,strictArgs} from './kag.js';
import {extractChapter} from './ks-po.js';
import {lowerDoor} from './lower-door.js';
import type {DoorIR} from './door-ir.js';
import type {Content} from './content.js';
import type {Language} from './locale.js';
import {readFile} from 'node:fs/promises';

const routes=[
 {id:'prologue',label:'prologstart',storage:'scenario.ks',target:undefined,pc:'main:prologue',gate:'scenario1'},
 {id:'door1',label:'scenario1start',storage:'scenario.ks',target:'*start',pc:'main:door1',gate:'scenario1'},
 {id:'door2',label:'scenario2start',storage:'scenario2.ks',target:'*start',pc:'integration:chapter2',gate:'scenario2'},
 {id:'door3',label:'scenario3start',storage:'scenario3.ks',target:'*start',pc:'integration:chapter3',gate:'scenario3'},
 {id:'search',label:'searchstart',storage:'search.ks',target:'*start',pc:'search:enter',gate:'search'},
 {id:'door4',label:'scenario4start',storage:'scenario4.ks',target:'*start',pc:'search:fourth',gate:'scenario4'},
 {id:'door5',label:'scenario5start',storage:'scenario5.ks',target:'*start',pc:'release:fifth-call',gate:'scenario5'},
 {id:'door6',label:'scenario6start',storage:'scenario6.ks',target:'*start',pc:'release:sixth-call',gate:'scenario6'},
 {id:'search2',label:'search2start',storage:'search2.ks',target:'*start',pc:'release:second-call',gate:'search2'},
 {id:'door7',label:'scenario7start',storage:'search2.ks',target:'*fromchapter7',pc:'release:seventh-call',gate:'scenario7'},
 {id:'door8',label:'scenario8start',storage:'scenario8.ks',target:'*start',pc:'release:eighth-call',gate:'scenario8'},
 {id:'door9',label:'scenario9start',storage:'scenario9.ks',target:'*start',pc:'release:ninth-call',gate:'fataend'},
] as const;
export const nativeChapterIds=routes.map(r=>r.id);
const menuObjects=['menu-bg','menu-title','menu-left','menu-right','menu-next','menu-prev',...Array.from({length:9},(_,i)=>'menu-ending'+i)];
/** Main authority owns menu choices and continues through existing chapter handoffs. */
export async function nativeChapterProgram(b:ProgramBuilder,content:Content,locale:Language,main:ProgramFunction,functions:readonly ProgramFunction[],extraHint:string){
 const source=await readFile(`private/text/${locale}/scenario/chapter.ks`,'utf8'),macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8'),tokens=tokenize(source,'chapter.ks'),code:Instruction[]=[],diagnostics:{code:string;asset:string;behavior:string}[]=[],fontSize=['jp','zh','ko'].includes(locale)?22:18;
 b.global({id:'original.native-menu-active',kind:'bool',initial:bool(false)}).global({id:'original.fromprolog',kind:'bool',initial:bool(false)}).global({id:'original.fromchapter1',kind:'bool',initial:bool(false)});
 const menuFunction=functions.find(f=>f.id==='source-replay-menu'),finalPage=menuFunction?.code.find(i=>i.op==='ui.wait'&&i.screen==='source-menu-page5');requireValue(menuFunction&&finalPage?.op==='ui.wait','NATIVE_FINAL_BOOK_PAGE');const previous=finalPage.buttons.find(v=>v.control==='menu-previous-5');requireValue(previous,'NATIVE_FINAL_BOOK_PREVIOUS');for(const [label,target]of [['chapter8','*search'],['ending','*scenario7']]){const a=tokens.findIndex(t=>t.kind==='label'&&t.name===label),z=tokens.findIndex((t,n)=>n>a&&t.kind==='label');requireValue(a>=0&&tokens.slice(a+1,z<0?undefined:z).some(t=>t.kind==='tag'&&t.name==='button'&&t.args.target===target),'NATIVE_SOURCE_PREVIOUS '+label);}previous.target='source-menu:native-previous5';menuFunction.code.push(branchExpression('source-menu:native-previous5',expr.profile('bool','original.fataend',bool(false)),'source-menu:page4','source-menu:page2'));
 const choose=main.code.find(i=>i.at==='title:wait');requireValue(choose?.op==='choice'&&choose.options.length===1&&choose.options[0]?.id==='start','NATIVE_TITLE_GATEWAY');choose.options.push({id:'native-extra',text:extraHint,target:'native-menu:gate'});
 const set=(at:string,dest:string,value:boolean)=>instruction('value.set',{at,dest,value:literal(bool(value))}),jump=(at:string,target:string)=>instruction('control.jump',{at,target}),cleanup=(prefix:string)=>menuObjects.map((id,n)=>instruction('stage.remove',{at:prefix+':remove'+n,id}));
 const restoreBgm=(prefix:string):Instruction[]=>[audioFade(prefix+':gain',prefix+'-gain','bgm',1,1,{policy:'replace'}),instruction('task.join',{at:prefix+':ready',group:prefix+'-ready',members:[prefix+'-gain'],skippable:false})];
 const entry=variable('original.replay-menu-entry','string'),request=variable('original.replay-request','string');
 code.push(branchExpression('native-menu:gate',expr.profile('bool','original.scenario1',bool(false)),'native-menu:enter','title:wait'),set('native-menu:enter','original.native-menu-active',true),instruction('save.policy',{at:'native-menu:no-save',allow:false}),instruction('value.set',{at:'native-menu:index',dest:entry.id,value:literal(string('index'))}),instruction('control.call',{at:'native-menu:call',function:'source-replay-menu',args:[]}));
 const titleMusic=main.code.find(i=>i.op==='audio.track'&&i.at==='title:music');requireValue(titleMusic?.op==='audio.track','NATIVE_TITLE_MUSIC');
 code.push(branchExpression('native-menu:dispatch',expr.equal(expr.variable(request),expr.text('title')),'native-menu:title','native-menu:test0'));
 for(const [n,r]of routes.entries())code.push(branchExpression('native-menu:test'+n,expr.equal(expr.variable(request),expr.text(r.id)),'native-menu:allowed-'+r.id,n===routes.length-1?'native-menu:enter':'native-menu:test'+(n+1)));
 code.push(set('native-menu:title','original.native-menu-active',false),...cleanup('native-menu:title'),instruction('audio.stop',{at:'native-menu:title-stop',channel:'bgm'}),...restoreBgm('native-menu:title-bgm'),{...titleMusic,at:'native-menu:title-music'},jump('native-menu:title-return','title:wait'));
 for(const r of routes){
  requireValue(main.code.some(i=>i.at===r.pc),'NATIVE_MAIN_ENTRY '+r.id);const a=tokens.findIndex(t=>t.kind==='label'&&t.name===r.label),z=tokens.findIndex((t,n)=>n>a&&t.kind==='label'),block=tokens.slice(a+1,z<0?undefined:z),out=block.findIndex(t=>t.kind==='tag'&&t.name==='mytrans_normal_out'),handoff=block.findIndex(t=>t.kind==='tag'&&t.name==='jump');requireValue(a>=0&&out>=0&&handoff>out,'NATIVE_SOURCE_ENTRY '+r.id);const jumpTag=block[handoff];requireValue(jumpTag?.kind==='tag'&&jumpTag.args.storage===r.storage&&jumpTag.args.target===r.target,'NATIVE_SOURCE_DESTINATION '+r.id);strictArgs(jumpTag,['storage','target']);
  const flags:Instruction[]=[],tail=block.slice(out+1,handoff).filter(t=>{if(t.kind==='tag'&&t.name==='eval'){strictArgs(t,['exp']);const exp=literalArg(t,'exp').replace(/\s/gu,'');if(exp==='kag.goToStartMenuItem.visible=true')return false;if(/^f\.(fromprolog|fromchapter1|memory[12])=true$/u.test(exp)){flags.push(set('native-menu:'+r.id+':source-flag'+flags.length,'original.'+exp.slice(2,-5),true));return false;}}if(r.id==='door7'&&t.kind==='tag'&&t.name==='mytrans_normal_in'){requireValue(t.args.storage==='5章_暖炉光'&&t.args.time==='3000','NATIVE_SEVENTH_HEARTH');return false;}return true;});
  const extraction=extractChapter(source,{id:'native-chapter',file:'chapter.ks',start:r.label});requireValue(extraction.pages.length===0,'NATIVE_PRELUDE_TEXT');const ir:DoorIR={tokens:tail,extraction,localized:new Map()},prelude=await lowerDoor(b,content,locale,source,macro,fontSize,{chapter:{id:'scenario7',file:'chapter.ks',start:r.label},catalogRoot:'locales',namespace:'native-chapter',ir,specializedIR:true,compactTiming:true,dynamicGeometry:true,proceduralEffects:true,proceduralHeartbeat:true,opacityObject:'text-opacity',functionNamespace:'native-prelude-'+r.id,instructionNamespace:'native-prelude-'+r.id,addressPrefix:'native-prelude-'+r.id});diagnostics.push(...prelude.sourceIssues);
  code.push(branchExpression('native-menu:allowed-'+r.id,expr.profile('bool','original.'+r.gate,bool(false)),'native-menu:start-'+r.id,'native-menu:enter'),set('native-menu:start-'+r.id,'original.native-menu-active',false),...cleanup('native-menu:'+r.id));
  code.push(instruction('ui.hide',{at:'native-menu:'+r.id+':hide'}),instruction('text.clear',{at:'native-menu:'+r.id+':clear'}),instruction('audio.stop',{at:'native-menu:'+r.id+':stop-bgm',channel:'bgm'}),...restoreBgm('native-menu:'+r.id+':bgm'),set('native-menu:'+r.id+':return-reset','original.return-title',false),...flags,...prelude.code,instruction('save.policy',{at:'native-menu:'+r.id+':save',allow:true}));
  if(r.id==='door2'){const wrapper=functions.find(f=>f.id==='door2-replay');requireValue(wrapper,'NATIVE_SECOND_SEED');const seed=wrapper.code.filter(i=>i.op==='stage.image');requireValue(seed.length>20,'NATIVE_SECOND_LAYOUT');code.push(...seed.map((i,n)=>({...i,at:'native-menu:door2:seed'+n})));}
  if(r.id==='door7')code.push(instruction('control.call',{at:'native-menu:door7:fromchapter',function:'seventh-replay-prelude',args:[]}));
  code.push(jump('native-menu:'+r.id+':continue',r.pc));
 }
 main.code.push(...code);return {diagnostics,routes:routes.map(r=>({id:r.id,source:r.storage+(r.target?':'+r.target:''),pc:r.pc,gate:r.gate})),musicReentry:'Source title music restarts on native-menu entry/return until the full clear-title program is compiled.'};
}
