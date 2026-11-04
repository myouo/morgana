import {specializeOmake} from './omake-constants.js';
import {instruction,branchExpression,uiCatalog,stageImage} from 'galbox-sdk/port-kit';
import type {ProgramBuilder} from 'galbox-sdk/port-kit';
import type {Instruction} from 'galbox-sdk/protocol';
import {lowerDoor} from './lower-door.js';
import type {DoorContext} from './lower-door.js';
import {forkDoor} from './door-routes.js';
import {readDoorIR} from './door-ir.js';
import type {DoorIR} from './door-ir.js';
import {doorSegment,sourceChoices,menuIR} from './door-segments.js';
import {searchMenu} from './search-menu.js';
import {searchCondition,searchExpression,omakeFlags} from './search-conditions.js';
import {chapters} from './chapter-catalog.js';
import {localeInfo} from '../src/locales.js';
import type {Language} from './locale.js';
import type {Content} from './content.js';
import {requireValue,strictArgs,literalArg} from './kag.js';
/** Nine source conversations in three finite question loops; standard SDK control flow only. */
export async function lowerOmake(b:ProgramBuilder,content:Content,locale:Language,source:string,macro:string,fontSize:number){
 const chapter=chapters.find(c=>c.id==='omake')!,specialized=specializeOmake(await readDoorIR(source,localeInfo[locale].html,{chapter,catalogRoot:'locales'})),ir=specialized.ir,choices=sourceChoices(ir),bodies:Awaited<ReturnType<typeof lowerDoor>>[]=[],menus:Awaited<ReturnType<typeof searchMenu>>[]=[],used=new Set(ir.tokens.filter(t=>['page-start','page-end','label'].includes(t.kind)));
 requireValue(choices.length===3,'OMAKE_MENU_COUNT');const menuLabels=['どこに行くか','どこに行くか2','どこに行くか3'],nextLabels=['縁の者に会う','ミシェル関係へ','ジゼルのところへ'],targets=[['メルに会いに行く','東洋の男に会いに行く','ヤコポに会いに行く'],['ネリーに会いに行く','ポーリーンに会いに行く','マリーアに会いに行く'],['エメに会いに行く','ジョルジュに会いに行く','ディディエに会いに行く']];
 const label=(name:string)=>{const n=ir.tokens.findIndex(t=>t.kind==='label'&&t.name===name);requireValue(n>=0,'OMAKE_LABEL '+name);return n;},part=(a:number,z:number)=>doorSegment(ir,a,z),call=(at:string,id:string)=>instruction('control.call',{at,function:id,args:[]}),jump=(at:string,target:string)=>instruction('control.jump',{at,target}),ret=(at:string)=>instruction('control.return',{at});
 const fn=(id:string,code:Instruction[])=>b.function({id,entry:code[0]!.at,layout:1,params:[],locals:[],returns:'void',code}),unknown=(c:DoorContext)=>{const out=forkDoor(c);out.stage.markUnknownAssets();return out;},canonical=(c:DoorContext)=>{c.stage.canonicalizePages();c.characters.resetRegistry();c.window='';return c.stage.take();};
 async function lower(input:DoorIR,id:string,c?:DoorContext){input.tokens.forEach(t=>used.add(t));const out=await lowerDoor(b,content,locale,source,macro,fontSize,{chapter,catalogRoot:'locales',namespace:'omake',functionNamespace:id,instructionNamespace:id,ir:input,specializedIR:true,segmentAtLabels:true,...(c?{context:c}:{}),compactTiming:true,dynamicGeometry:true,proceduralEffects:true,proceduralHeartbeat:true,stableAudioPrefix:'omake-audio',addressPrefix:'omake-fx',opacityObject:'text-opacity'});bodies.push(out);return out;}
 const start=await lower(part(0,label(menuLabels[0]!)),'omake-start'),startEnd=canonical(start.context),bridge:Instruction[]=[...start.code,...startEnd];let base:DoorContext=start.context;
 const pairs=new Map<number,number>(),stack:number[]=[];for(const [n,t]of ir.tokens.entries())if(t.kind==='tag'){if(t.name==='if')stack.push(n);else if(t.name==='endif'){const a=stack.pop();requireValue(a!==undefined,'OMAKE_SOURCE_ENDIF');pairs.set(a,n);}else requireValue(!['else','elsif'].includes(t.name),'OMAKE_SOURCE_CONDITIONAL');}requireValue(stack.length===0,'OMAKE_SOURCE_IF');
 for(let stage=0;stage<3;stage++){
  const menu=await searchMenu(b,content,locale,menuIR(ir,choices[stage]!.tokens),'omake-menu'+stage);menus.push(menu);choices[stage]!.tokens.forEach(t=>used.add(t));requireValue(menu.buttons.length===3&&menu.buttons.every((v,n)=>v.target===targets[stage]![n]),'OMAKE_MENU_TARGETS '+stage);
  let joined:DoorContext|undefined;const prefix=await lower(part(label(menuLabels[stage]!),choices[stage]!.start),'omake-prefix'+stage,unknown(base)),prefixEnd=canonical(prefix.context),expression=omakeFlags.slice(stage*3,stage*3+3).map(k=>'f.'+k+'==true').join('&&'),code:Instruction[]=[...prefix.code,...prefixEnd,...menu.show,menu.wait];
  for(let option=0;option<3;option++){
   const a=label(targets[stage]![option]!),condition=ir.tokens.findIndex((t,n)=>n>a&&t.kind==='tag'&&t.name==='if'),end=pairs.get(condition),test=ir.tokens[condition];requireValue(test?.kind==='tag'&&test.name==='if'&&literalArg(test,'exp').replace(/\s/gu,'')===expression&&end!==undefined,'OMAKE_ROUTE_CONDITION');strictArgs(test,['exp']);const inside=ir.tokens.slice(condition+1,end).filter(t=>t.kind!=='text'||t.text.trim());requireValue(inside.length===1&&inside[0]?.kind==='tag'&&inside[0].name==='jump'&&inside[0].args.storage===undefined&&inside[0].args.target==='*'+nextLabels[stage],'OMAKE_ROUTE_NEXT');strictArgs(inside[0],['target']);const again=ir.tokens.findIndex((t,n)=>n>end&&t.kind==='tag'&&t.name==='jump'),back=ir.tokens[again];requireValue(back?.kind==='tag'&&back.args.storage===undefined&&back.args.target==='*'+menuLabels[stage]&&ir.tokens.slice(end+1,again).every(t=>t.kind==='text'&&!t.text.trim()),'OMAKE_ROUTE_BACK');strictArgs(back,['target']);ir.tokens.slice(condition,again+1).forEach(t=>used.add(t));
   const body=await lower(part(a,condition),'omake-option'+stage+'-'+option,unknown(prefix.context)),finish=canonical(body.context),hide=menu.hide.map((i,k)=>({...i,at:menu.id+':o'+option+(k?':hide-frame':'')}));const signature=(c:DoorContext)=>{const m=c.stage.get('message0');return JSON.stringify({visible:m.visible,asset:m.asset,left:m.leftMargin,right:m.rightMargin,top:m.topMargin,bottom:m.bottomMargin});};requireValue(!joined||signature(joined)===signature(body.context),'OMAKE_JOIN_PRESENTATION '+stage);joined=body.context;code.push(...hide,...body.code,...finish,branchExpression('omake-loop'+stage+':test'+option,searchExpression(searchCondition(expression)),'omake-loop'+stage+':return',prefix.code[0]!.at));
  }
  code.push(ret('omake-loop'+stage+':return'));fn('omake-loop'+stage,code);bridge.push(call('omake:enter-menu'+stage,'omake-loop'+stage));requireValue(joined,'OMAKE_JOIN_CONTEXT');base=joined;
  if(stage<2){const common=await lower(part(label(nextLabels[stage]!),label(menuLabels[stage+1]!)),'omake-between'+stage,unknown(base)),finish=canonical(common.context);bridge.push(...common.code,...finish);base=common.context;}
 }
 const external=ir.tokens.findIndex(t=>t.kind==='tag'&&t.name==='jump'&&t.args.storage==='title.ks'),handoff=ir.tokens[external];requireValue(handoff?.kind==='tag'&&handoff.args.target===undefined,'OMAKE_SOURCE_HANDOFF');strictArgs(handoff,['storage']);used.add(handoff);const outro=await lower(part(label(nextLabels[2]!),external),'omake-outro',unknown(base)),outroEnd=canonical(outro.context);
 const blank=await content.solid('transparent'),init:Instruction[]=[stageImage('omake-menu:init','search-menu-frame',blank,{alpha:0},{z:300,visible:false})];for(let n=0;n<10;n++)init.push(stageImage('omake-menu:init-label'+n,'search-menu-label-'+n,blank,{alpha:0},{parent:'search-menu-frame',visible:false}));
 fn('omake-bridge',[...init,...bridge,...outro.code,...outroEnd,ret('omake:return')]);b.ui(uiCatalog('morgana-omake','v1',menus.map(m=>m.screen)));
 for(const t of ir.tokens){if(used.has(t)||t.kind==='text'&&!t.text.trim())continue;requireValue(t.kind==='tag'&&t.name==='s','OMAKE_UNCONSUMED '+(t.kind==='tag'?t.name+':'+t.source.line:t.kind));strictArgs(t,[]);}
 return {bodies,menus,sourceIssues:specialized.sourceIssues,autoAt:bodies.flatMap(v=>v.autoAt),entry:'omake-bridge',source:ir};
}
