import {readFile} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {audioFade,branchExpression,expr,expressionWire,instruction,literal,stageImage,stageTransition,uiImageButton,uiScreen,uiCatalog,uiSound,variable} from 'galbox-sdk/port-kit';
import type {ProgramBuilder,TypedExpression} from 'galbox-sdk/port-kit';
import {bool,string} from 'galbox-sdk/protocol';
import type {Function as ProgramFunction,Instruction,ModuleHeader,JsonValue} from 'galbox-sdk/protocol';
import type {Content} from './content.js';
import type {Language} from './locale.js';
import {hash} from './locale.js';
import {requireValue,tokenize,strictArgs} from './kag.js';

const exec=promisify(execFile);
export const allEndingKeys=[...Array.from({length:7},(_,n)=>'badend'+(n+1)),'fataend'];
export function allEndingsExpression():TypedExpression<'bool'>{
 const terms=allEndingKeys.map(key=>expr.profile('bool','original.'+key,bool(false)));
 const fold=(a:number,z:number):TypedExpression<'bool'>=>z-a===1?terms[a]!:expr.logic('and',fold(a,a+Math.floor((z-a)/2)),fold(a+Math.floor((z-a)/2),z));
 return fold(0,terms.length);
}

/** Compile the original ending-list bonus condition and handoff into the main Core. */
export async function nativeEndingBonus(b:ProgramBuilder,content:Content,locale:Language,header:ModuleHeader,functions:ProgramFunction[],storyObjects:readonly string[]){
 const raw=await readFile(`private/text/${locale}/scenario/endinglist.ks`,'utf8'),tokens=tokenize(raw,'endinglist.ks');
 const conditions=tokens.filter(t=>t.kind==='tag'&&t.name==='if'&&t.args.exp?.includes('sf.badend1')&&t.args.exp?.includes('sf.fataend'));
 requireValue(conditions.length===2&&conditions.every(t=>t.kind==='tag'&&t.args.exp?.replace(/\s/gu,'')===allEndingKeys.map(k=>'sf.'+k+'==true').join('&&')),'BONUS_SOURCE_ALL_ENDINGS');
 const icon=tokens.findIndex(t=>t.kind==='tag'&&t.name==='button'&&t.args.target==='*prologue'),buttonTag=tokens[icon],locate=tokens[icon-1];
 requireValue(buttonTag?.kind==='tag'&&buttonTag.args.graphic==='アイコン_プロローグ'&&buttonTag.args.enterse==='button'&&locate?.kind==='tag'&&locate.name==='locate','BONUS_SOURCE_BUTTON');
 strictArgs(buttonTag,['graphic','target','enterse']);strictArgs(locate,['x','y']);
 const jump=tokens.find(t=>t.kind==='tag'&&t.name==='jump'&&t.args.storage==='prologue.ks');requireValue(jump?.kind==='tag'&&jump.args.target===undefined,'BONUS_SOURCE_JUMP');
 const prologue=tokens.findIndex(t=>t.kind==='label'&&t.name==='prologue'),leave=tokens.slice(prologue+1,tokens.findIndex((t,n)=>n>prologue&&t.kind==='label'));
 requireValue(leave.some(t=>t.kind==='tag'&&t.name==='trans'&&t.args.time==='500')&&leave.some(t=>t.kind==='tag'&&t.name==='mytrans_normal_out'&&t.args.time==='3000'),'BONUS_SOURCE_LEAVE');
 const body=tokenize(await readFile(`private/text/${locale}/scenario/prologue.ks`,'utf8'),'prologue.ks'),handoffs=body.filter(t=>t.kind==='tag'&&t.name==='jump');
 requireValue(handoffs.length===1&&handoffs[0]?.kind==='tag','BONUS_SOURCE_RETURN');const handoff=handoffs[0];
 requireValue(handoff.args.storage==='title.ks'&&handoff.args.target===undefined||handoff.args.storage==='endinglist.ks'&&handoff.args.target==='*ending_main','BONUS_SOURCE_RETURN_TARGET');

 const config=await readFile(`private/text/${locale}/system/Config.tjs`,'utf8'),marginL=Number(/;marginL\s*=\s*(\d+)/u.exec(config)?.[1]),marginT=Number(/;marginT\s*=\s*(\d+)/u.exec(config)?.[1]);
 requireValue(Number.isFinite(marginL)&&Number.isFinite(marginT),'BONUS_SOURCE_MARGINS');
 const source=content.sourceButtonImage(buttonTag.args.graphic),bytes=await readFile(source),width=Math.floor(bytes.readUInt32BE(16)/3),height=bytes.readUInt32BE(20),prepared=`private/generated/bonus-button-${hash(bytes)}.png`;
 requireValue(width>0&&height>0,'BONUS_BUTTON_SHEET');const crop:string[]=[];for(const frame of [0,2,1])crop.push('(',source,'-crop',`${width}x${height}+${frame*width}+0`,'+repage',')');await exec('magick',[...crop,'+append','-depth','8','-strip',prepared]);
 const control=uiImageButton('menu-bonus-prologue',await content.encodedImage(prepared),{rect:{x:(Number(locate.args.x)+marginL)*1.6,y:(Number(locate.args.y)+marginT)*1.2,width:width*1.6,height:height*1.2},frameWidth:width,frameHeight:height,text:'prologue',visible:false,enterSound:uiSound(await content.audio('button','buffer'))});
 const extraScreen=uiCatalog('bonus-button','v1',[uiScreen('source-menu-endings','endings',[control],'#000000',{overlay:true})]).screens[0]!;
 const screen=header.ui?.screens.find(s=>s.id==='source-menu-endings');requireValue(screen,'BONUS_ENDINGS_SCREEN');screen.controls.push(extraScreen.controls[0]!);
 const menu=functions.find(f=>f.id==='source-replay-menu'),main=functions.find(f=>f.id==='main');requireValue(menu&&main,'BONUS_MAIN_MENU');
 const show=menu.code.find(i=>i.op==='ui.show'&&i.screen===screen.id),wait=menu.code.find(i=>i.op==='ui.wait'&&i.screen===screen.id);requireValue(show&&wait?.op==='ui.wait','BONUS_ENDINGS_WAIT');
 wait.buttons.push({control:control.id,target:'bonus-menu:leave'});
 const blank=await content.solid('transparent'),black=(await content.image('blacksozai')).asset,endingImage=(await content.image('エンディングリスト9')).asset,endingBackground=(await content.image('エンディングリスト背景')).asset;
 // Existing branch labels must enter the new condition before the old show.
 for(const i of menu.code){if(i.op==='control.jump'&&i.target===show.at)i.target='bonus-menu:gate';if(i.op==='control.branch'){if(i.yes===show.at)i.yes='bonus-menu:gate';if(i.no===show.at)i.no='bonus-menu:gate';}}
 const showIndex=menu.code.indexOf(show);
 menu.code.splice(showIndex,0,branchExpression('bonus-menu:gate',allEndingsExpression(),'bonus-menu:row',show.at),stageTransition('bonus-menu:row','bonus-row-fade','menu-ending8',endingImage,{duration:500}),instruction('task.join',{at:'bonus-menu:row-ready',group:'bonus-row-ready',members:['bonus-row-fade'],skippable:true}));
 menu.code.splice(menu.code.indexOf(show)+1,0,instruction('ui.visible',{at:'bonus-menu:visible',screen:screen.id,control:control.id,value:expressionWire(allEndingsExpression())}));
 const rows=Array.from({length:9},(_,n)=>'menu-ending'+n),menuObjects=['menu-bg','menu-title','menu-left','menu-right','menu-next','menu-prev',...rows];
 menu.code.push(instruction('ui.hide',{at:'bonus-menu:leave'}),...rows.map((id,n)=>stageTransition('bonus-menu:hide'+n,'bonus-hide'+n,id,blank,{duration:500})),instruction('task.join',{at:'bonus-menu:hidden',group:'bonus-hidden',members:rows.map((_,n)=>'bonus-hide'+n),skippable:true}),stageTransition('bonus-menu:black','bonus-black','menu-bg',black,{duration:3000}),instruction('task.join',{at:'bonus-menu:black-ready',group:'bonus-black-ready',members:['bonus-black'],skippable:true}),instruction('value.set',{at:'bonus-menu:request',dest:'original.replay-request',value:literal(string('complete-prologue'))}),instruction('control.return',{at:'bonus-menu:return'}));

 // Resume the original ending list directly after languages that jump back to it.
 const normalEntry=menu.entry,seeds=menu.code.filter(i=>i.op==='stage.image'&&menuObjects.includes(i.id)),endingFade=menu.code.find(i=>i.op==='stage.transition'&&i.id==='menu-bg'&&i.asset===endingBackground.id);
 requireValue(seeds.length===menuObjects.length&&endingFade,'BONUS_MENU_RESUME_SEEDS');menu.entry='bonus-menu:entry';
 menu.code.push(branchExpression(menu.entry,expr.equal(expr.variable(variable('original.replay-menu-entry','string')),expr.text('endings')),'bonus-menu:resume','source-menu:init'),instruction('value.set',{at:'bonus-menu:resume',dest:'original.replay-request',value:literal(string(''))}),...seeds.map((i,n)=>({...i,at:'bonus-menu:seed'+n,...(i.op==='stage.image'?{asset:i.id==='menu-bg'?black.id:blank.id}:{})})),instruction('control.jump',{at:'bonus-menu:resume-list',target:endingFade.at}));
 requireValue(normalEntry==='source-menu:init','BONUS_MENU_INITIAL_ENTRY');
 const dispatch=main.code.find(i=>i.at==='native-menu:dispatch');requireValue(dispatch?.op==='control.branch'&&dispatch.no==='native-menu:test0','BONUS_NATIVE_DISPATCH');dispatch.no='native-bonus:request';
 b.function({id:'native-bonus-bgm',entry:'native-bonus:bgm',layout:1,params:[],locals:[],returns:'void',code:[audioFade('native-bonus:bgm','native-bonus-bgm','bgm',1,1,{policy:'replace'}),instruction('task.join',{at:'native-bonus:bgm-ready',group:'native-bonus-bgm-ready',members:['native-bonus-bgm'],skippable:false}),instruction('control.return',{at:'native-bonus:bgm-return'})]});
 const code:Instruction[]=[branchExpression('native-bonus:request',expr.equal(expr.variable(variable('original.replay-request','string')),expr.text('complete-prologue')),'native-bonus:gate','native-menu:test0'),branchExpression('native-bonus:gate',allEndingsExpression(),'native-bonus:start','native-menu:enter'),instruction('value.set',{at:'native-bonus:start',dest:'original.native-menu-active',value:literal(bool(false))}),instruction('ui.hide',{at:'native-bonus:hide'}),instruction('text.clear',{at:'native-bonus:clear'}),...menuObjects.map((id,n)=>instruction('stage.remove',{at:'native-bonus:remove'+n,id})),instruction('audio.stop',{at:'native-bonus:stop-bgm',channel:'bgm'}),instruction('control.call',{at:'native-bonus:restore-bgm',function:'native-bonus-bgm',args:[]}),instruction('save.policy',{at:'native-bonus:save',allow:true}),instruction('control.call',{at:'native-bonus:play',function:'bonus/main',args:[]})];
 if(handoff.args.storage==='title.ks')code.push(instruction('control.jump',{at:'native-bonus:return',target:'release:return-title'}));
 else{
  const title=main.code.find(i=>i.at==='title:menu-reveal');requireValue(title?.op==='stage.rule','BONUS_TITLE_BASE');
  code.push(...storyObjects.filter(id=>id!=='background'&&id!=='text-opacity').map((id,n)=>instruction('stage.remove',{at:'native-bonus:story-remove'+n,id})),...header.textLayout!.windows.map((w,n)=>instruction('text.window.visible',{at:'native-bonus:window'+n,window:w.id,visible:false})),instruction('text.clear',{at:'native-bonus:return-clear'}),stageImage('native-bonus:restore-title','background',{id:title.asset,kind:'image'},{x:0,y:0,scaleX:1.6,scaleY:1.2}),instruction('save.policy',{at:'native-bonus:no-save',allow:false}),instruction('value.set',{at:'native-bonus:menu-active',dest:'original.native-menu-active',value:literal(bool(true))}),instruction('value.set',{at:'native-bonus:ending-entry',dest:'original.replay-menu-entry',value:literal(string('endings'))}),instruction('control.jump',{at:'native-bonus:return',target:'native-menu:call'}));
 }
 main.code.push(...code);
 return {condition:allEndingKeys,returnTo:handoff.args.storage+(handoff.args.target?':'+handoff.args.target:''),button:{x:Number(locate.args.x)+marginL,y:Number(locate.args.y)+marginT,width,height}};
}
