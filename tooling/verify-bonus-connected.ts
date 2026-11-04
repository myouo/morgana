import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import {createCore} from 'galbox-sdk/core';
import type {Core} from 'galbox-sdk/core';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import type {ModuleProgram} from 'galbox-sdk/port-kit';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {bool,isTextComplete,isTextConfirming,parseProfile} from 'galbox-sdk/protocol';
import type {Profile} from 'galbox-sdk/protocol';
import {installModuleFiles} from './install-module-files.js';
import {readDoorIR} from './door-ir.js';
import {readDoorText} from './door-text.js';
import {chapters} from './chapter-catalog.js';
import {languages} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {requireValue} from './kag.js';
import {allEndingKeys} from './native-ending-bonus.js';

const root=process.env.FATA_BONUS_ROOT??'generated/bonus-connected',read=async(p:string)=>new Uint8Array(await readFile(p));let input=0;
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 const manifest=decodeWire('ModuleManifest',await read(`${root}/programs/${locale}.modules.pb`)),source=createModuleProgram(manifest),files=new Map(await Promise.all(manifest.modules.map(async m=>[m.id,decodeWire('ProgramModule',await read(root+'/'+m.uri))]as const)));installModuleFiles(source,[...files.values()]);
 const profileLocale=['zh','en'].includes(locale)?locale:'zh',recorded=decodeWire('Profile',await read(`generated/ninth-connected/cuts/${profileLocale}-ended.profile.pb`)),base:Profile=profileLocale===locale?recorded:{revision:0,values:recorded.values,read:[]};
 const compile=JSON.parse(await readFile(`artifacts/bonus-connected/${locale}-compile.json`,'utf8'));requireValue(root!=='generated/bonus-connected'||compile.release===source.release,'BONUS_CONNECTED_RELEASE');
 const raw=await readFile(`private/text/${locale}/scenario/prologue.ks`,'utf8'),macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8'),ir=await readDoorIR(raw,localeInfo[locale].html,{chapter:chapters.find(c=>c.id==='complete-prologue')!,catalogRoot:'locales'}),story=readDoorText(ir,macro,['jp','zh','ko'].includes(locale)?22:18,{namespace:'complete-prologue',extended:true,historyPolicy:true}),expected=new Map(story.nodes.flatMap(n=>n.kind==='text'?[['bonus/'+n.at,n.atoms.map(a=>a.kind==='text'?a.text:a.kind==='break'?'\n':'').join('')]as const]:[])),rich=new Map(source.program(source.loaded()).functions.flatMap(f=>f.code).flatMap(i=>i.op==='text.rich'?[[i.at,i]as const]:[]));
 let maxObjects=0,maxTasks=0;
 function settle(c:Core,active:ModuleProgram=source){for(let n=0;n<2000;n++){const status=c.run(100);if(c.requiredFunction){installModuleFiles(active,active.closure([active.moduleForFunction(c.requiredFunction)]).filter(id=>!active.has(id)).map(id=>files.get(id)!));continue;}c.drainEffects();const s=c.view().run;if(s.status==='failed')throw new Error('BONUS_CONNECTED_CORE '+c.view().error);maxObjects=Math.max(maxObjects,s.stage.length);maxTasks=Math.max(maxTasks,s.tasks.length);let changed=false;for(const t of s.tasks)if(t.kind==='media'&&t.status==='running'&&t.mediaTask?.phase==='pending'){c.accept({type:'task',task:t.id,attempt:t.attempt!,result:'completed'});changed=true;}if(status==='stable'&&!changed)return;}throw new Error('BONUS_CONNECTED_SPIN');}
 function advance(c:Core){const v=c.view(),s=v.run,w=s.wait;requireValue(w,'BONUS_CONNECTED_WAIT');if(w.kind==='text')c.accept({type:isTextComplete(s.text!)||isTextConfirming(s.text!)?'advance':'reveal',prompt:w.prompt,inputId:'bonus-'+ ++input});else if(w.kind==='group'||w.kind==='delay'){const ids=w.kind==='delay'?[w.task]:s.groups.find(g=>g.id===w.group)!.members;c.accept({type:'tick',ms:Math.max(1,...ids.flatMap(id=>{const t=s.tasks.find(t=>t.id===id);return t?.status==='running'?[t.duration-t.elapsed]:[];}))});}else if(w.kind==='flush')c.accept({type:'flushAck',revision:v.profile.revision});else if(w.kind==='media'){const t=s.tasks.find(t=>t.id===w.task)!;c.accept({type:'media.ended',task:t.id,attempt:t.attempt!});}else throw new Error('BONUS_CONNECTED_INPUT '+w.kind);}
 function until(c:Core,predicate:(c:Core)=>boolean){for(let n=0;n<20000;n++){settle(c);if(predicate(c))return;advance(c);}throw new Error('BONUS_CONNECTED_LIMIT');}
 function click(c:Core,control:string){const s=c.view().run,w=s.wait;requireValue(w?.kind==='ui'&&s.ui?.active?.screen.controls.some(b=>b.id===control&&b.visible&&b.enabled),'BONUS_CONNECTED_CONTROL '+control);const id={prompt:w.prompt,attempt:w.attempt,generation:w.generation};c.accept({type:'ui.activate',...id});c.accept({type:'ui.click',...id,control,inputId:'bonus-ui-'+ ++input});}
 const matrix=[];let core:Core|undefined;
 // These are explicit UI fixtures. They do not claim that all eight endings
 // were replayed sequentially into one native save during this test.
 for(const missing of [...allEndingKeys,null]){
  const profile=parseProfile(base);for(const key of allEndingKeys)profile.values['original.'+key]=bool(key!==missing);
  const c=createCore(source,profile);until(c,c=>c.view().run.wait?.at==='title:wait');const w=c.view().run.wait;requireValue(w?.kind==='choice','BONUS_CONNECTED_TITLE');c.accept({type:'choose',prompt:w.prompt,option:'native-extra',inputId:'bonus-extra-'+ ++input});until(c,c=>c.view().run.wait?.kind==='ui');click(c,'menu-endinglist');until(c,c=>!!c.view().run.ui?.active?.screen.controls.some(b=>b.visible&&b.id==='menu-ending-title'));
  const button=c.view().run.ui!.active!.screen.controls.find(b=>b.id==='menu-bonus-prologue');requireValue(button&&button.visible===(missing===null),'BONUS_CONNECTED_UNLOCK '+missing);
  const row=source.program(source.loaded()).functions.find(f=>f.id==='source-replay-menu')!.code.find(i=>i.at==='bonus-menu:row');requireValue(row?.op==='stage.transition','BONUS_CONNECTED_ROW');requireValue((c.view().run.stage.find(o=>o.id==='menu-ending8')?.asset===row.asset)===(missing===null),'BONUS_CONNECTED_ROW_UNLOCK');
  matrix.push({missing,visible:button.visible});if(missing===null)core=c;
 }
 requireValue(core,'BONUS_CONNECTED_READY');click(core,'menu-bonus-prologue');until(core,c=>c.view().run.wait?.kind==='text');requireValue(core.view().run.frames[0]?.functionId==='main'&&core.view().run.frames.some(f=>f.functionId==='bonus/main')&&!core.view().run.replayScene&&core.view().run.globals['original.native-menu-active']?.value===false&&core.view().run.audioState?.gains.bgm===1&&core.view().saveReason===null,'BONUS_CONNECTED_AUTHORITY');
 let active=source;const seen=new Set<string>(),cuts=new Set<string>(),oldRead=new Set(base.read);
 async function archive(name:string){if(cuts.has(name))return;cuts.add(name);const cut=core!.capture(),cold=createModuleProgram(manifest);installModuleFiles(cold,cold.binding(cut).map(id=>files.get(id)!));const next=createCore(cold,core!.view().profile,decodeWire('Snapshot',encodeWire('Snapshot',cut))),restored=next.capture();requireValue(isDeepStrictEqual(restored.frames,cut.frames)&&isDeepStrictEqual(restored.stage,cut.stage)&&isDeepStrictEqual(restored.text,cut.text)&&restored.audioState?.gains.bgm===1,'BONUS_CONNECTED_COLD '+name);await mkdir(root+'/cuts',{recursive:true});await writeFile(`${root}/cuts/${locale}-${name}.snapshot.pb`,encodeWire('Snapshot',cut));await writeFile(`${root}/cuts/${locale}-${name}.profile.pb`,encodeWire('Profile',core!.view().profile));core=next;active=cold;}
 let returned=false;
 for(let n=0;n<15000;n++){
  settle(core,active);const s=core.view().run;
  for(const text of [...s.history,...(s.text?[s.text]:[])])if(text.rich&&expected.has(text.rich.at)){requireValue(text.content===expected.get(text.rich.at),'BONUS_CONNECTED_TEXT '+text.rich.at);let i=rich.get(text.rich.at);requireValue(i,'BONUS_CONNECTED_RICH');for(;;){seen.add(i.at);if(!i.appendFrom)break;i=rich.get(i.appendFrom);requireValue(i,'BONUS_CONNECTED_PREFIX');}}
  if(s.status==='ended'||s.wait?.at==='title:wait'||s.ui?.active?.screen.controls.some(b=>b.visible&&b.id==='menu-ending-title')){returned=true;break;}
  if(s.wait?.kind==='text')await archive(seen.size===expected.size?'last':seen.size>expected.size/2?'middle':'start');
  advance(core);
 }
 requireValue(returned&&seen.size===expected.size,'BONUS_CONNECTED_COVERAGE '+seen.size+'/'+expected.size);
 const end=core.view(),readUnits=new Set(end.profile.read);requireValue([...oldRead].every(unit=>readUnits.has(unit)),'BONUS_CONNECTED_OLD_READ');for(const key of allEndingKeys)requireValue(end.profile.values['original.'+key]?.value===true,'BONUS_CONNECTED_OLD_UNLOCKS');
 let replayed=false;
 if(compile.returnTo==='title.ks')requireValue((end.run.status==='ended'&&end.run.frames[0]?.pc==='release:return-title'||end.run.wait?.at==='title:wait')&&end.run.frames[0]?.functionId==='main','BONUS_CONNECTED_RETURN_TITLE');
 else{requireValue(end.run.wait?.kind==='ui'&&end.run.ui?.active?.screen.controls.some(b=>b.visible&&b.id==='menu-ending-title')&&end.run.globals['original.native-menu-active']?.value===true&&!end.run.stage.some(o=>o.id.startsWith('door:')),'BONUS_CONNECTED_RETURN_LIST');click(core,'menu-bonus-prologue');for(let n=0;n<2000;n++){settle(core,active);if(core.view().run.wait?.kind==='text'){replayed=true;break;}advance(core);}requireValue(replayed&&core.view().run.frames.some(f=>f.functionId==='bonus/main'),'BONUS_CONNECTED_REPEAT');}
 const reportRoot=root.replace('generated/','artifacts/');await mkdir(reportRoot,{recursive:true});const report={locale,release:source.release,profileLocale,matrix,textParts:seen.size,cuts:[...cuts],oldReadKept:oldRead.size,readUnits:readUnits.size,returnTo:compile.returnTo,replayed,maxObjects,maxTasks,completed:true,authority:'single-main-program',scope:'nine explicit unlock fixtures; full source bonus text; three legal cold prompts; old read/unlocks preserved; source-specific return. Sequential all-ending native play remains separate.'};await writeFile(`${reportRoot}/${locale}-${root==='generated/bonus-connected'?'verified':'bonus-regression'}.json`,JSON.stringify(report,null,2));console.log(report);
}
