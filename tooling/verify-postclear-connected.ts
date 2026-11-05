import {sdkProvenance} from './sdk-provenance.js';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import {createCore} from 'galbox-sdk/core';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {isTextComplete,isTextConfirming} from 'galbox-sdk/protocol';
import type {ProgramModule} from 'galbox-sdk/protocol';
import {installModuleFiles} from './install-module-files.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
const sdk=await sdkProvenance();
const root='generated/postclear-connected',read=async(p:string)=>new Uint8Array(await readFile(p));let input=0;
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 const manifest=decodeWire('ModuleManifest',await read(`${root}/programs/${locale}.modules.pb`)),source=createModuleProgram(manifest),files=new Map<string,ProgramModule>();const load=async(ids:readonly string[])=>{const needed=source.closure(ids).filter(id=>!source.has(id));await Promise.all(needed.map(async id=>{if(!files.has(id))files.set(id,decodeWire('ProgramModule',await read(root+'/'+source.descriptor(id).uri)));}));installModuleFiles(source,needed.map(id=>files.get(id)!));};await load([source.entryModule]);const profileLocale=['zh','en'].includes(locale)?locale:'zh',recorded=decodeWire('Profile',await read(`generated/ninth-connected/cuts/${profileLocale}-ended.profile.pb`)),profile=profileLocale===locale?recorded:{revision:0,values:recorded.values,read:[]},core=createCore(source,profile),cuts=new Set<string>(),text=new Set<string>(),visited=new Set<string>();let maid=0,questions=0,menus=0,choices=0,soul=0,maxObjects=0,maxTasks=0;core.accept({type:'text.preferences',value:{intervalMs:0}});
 async function archive(name:string){if(cuts.has(name))return;cuts.add(name);const snapshot=core.capture(),cold=createModuleProgram(manifest);installModuleFiles(cold,cold.binding(snapshot).map(id=>files.get(id)!));const next=createCore(cold,core.view().profile,decodeWire('Snapshot',encodeWire('Snapshot',snapshot))).capture();requireValue(isDeepStrictEqual(next.frames,snapshot.frames)&&isDeepStrictEqual(next.stage,snapshot.stage)&&isDeepStrictEqual(next.text,snapshot.text),'POSTCLEAR_MAIN_COLD '+name);await mkdir(root+'/cuts',{recursive:true});await writeFile(`${root}/cuts/${locale}-${name}.snapshot.pb`,encodeWire('Snapshot',snapshot));await writeFile(`${root}/cuts/${locale}-${name}.profile.pb`,encodeWire('Profile',core.view().profile));console.log({locale,cut:name,read:core.view().profile.read.length});}
 let enteredFifth=false;
 for(let turn=0;turn<100000;turn++){
  if(turn%2000===0){console.log({locale,turn,observedTextParts:text.size,loaded:source.loaded().length});await new Promise<void>(resolve=>setTimeout(resolve,0));}
  const status=core.run(100);if(core.requiredFunction){await load([source.moduleForFunction(core.requiredFunction)]);continue;}core.drainEffects();const v=core.view(),s=v.run;if(s.status==='failed')throw new Error('POSTCLEAR_MAIN_CORE '+v.error);maxObjects=Math.max(maxObjects,s.stage.length);maxTasks=Math.max(maxTasks,s.tasks.length);for(const t of s.tasks)if(t.kind==='media'&&t.status==='running'&&t.mediaTask?.phase==='pending')core.accept({type:'task',task:t.id,attempt:t.attempt!,result:'completed'});
  if(s.text?.rich?.at.startsWith('postclear-')){text.add(s.text.rich.at);if(s.text.speaker&&s.text.textId.includes('postclear-')&&s.text.speaker.includes('灵魂'))soul++;}
  if(process.env.FATA_POSTCLEAR_TRACE==='1'&&turn%100===0)console.log({locale,turn,status,required:core.requiredFunction,wait:s.wait,text:s.text&&{id:s.text.textId,complete:isTextComplete(s.text),confirm:isTextConfirming(s.text)},frames:s.frames.map(f=>({id:f.functionId,pc:f.pc})),tasks:s.tasks.filter(t=>t.status==='running').map(t=>({kind:t.kind,at:t.at,elapsed:t.elapsed,duration:t.duration}))});
  if(status!=='stable')continue;const w=s.wait;requireValue(w,'POSTCLEAR_MAIN_WAIT');
  if(w.kind==='choice'){
   let option=w.options.at(-1)!.id;
   if(w.at==='title:wait')option='start';else if(w.at.includes('postclear-prelude:choice')){option=w.options[0]!.id;await archive('greeting');}else if(w.at.includes('postclear-second:choice')){option='remember';await archive('memory');}else if(w.at.includes('fourth-choice-0')){requireValue(w.options.length===3,'POSTCLEAR_EARNED_FOURTH_GATE');await archive('fourth-gate');}
   core.accept({type:'choose',prompt:w.prompt,option,inputId:'postclear-main-choice-'+ ++input});choices++;
  }else if(w.kind==='ui'){
   requireValue(w.screen.startsWith('postclear-search/'),'POSTCLEAR_MAIN_UI '+w.screen);const visible=s.ui!.active!.screen.controls.filter(c=>c.visible&&c.enabled).map(c=>c.id);let control:string;
   if(w.screen.endsWith('/search-questions')){questions++;control=visible.at(-1)!;requireValue(visible.length===5-questions,'POSTCLEAR_QUESTION_REMOVAL');}
   else if(w.screen.endsWith('/search-key'))control='search-key-b0';
   else if(w.screen.endsWith('/search-places')){const rooms=visible.filter(id=>!id.endsWith('-b9')&&!id.endsWith('-b6')&&!id.endsWith('-b7'));if(maid<10){control='search-places-b9';maid++;}else if(!visited.has('search-places-b7'))control='search-places-b7';else control=rooms.at(-1)??'search-places-b6';if(!control.endsWith('-b9')&&!control.endsWith('-b6'))visited.add(control);}
   else{requireValue(w.screen.endsWith('/search-final-choice'),'POSTCLEAR_SEARCH_SCREEN');control=visible[0]!;}
   requireValue(visible.includes(control),'POSTCLEAR_MAIN_HIDDEN '+control);await archive(w.screen.split('/').at(-1)!);const identity={prompt:w.prompt,attempt:w.attempt,generation:w.generation};core.accept({type:'ui.activate',...identity});core.accept({type:'ui.click',...identity,control,inputId:'postclear-main-ui-'+ ++input});menus++;
  }else if(w.kind==='text'){
   if(w.at.startsWith('fifth/')){enteredFifth=true;await archive('fifth-entry');break;}
   if(w.at.startsWith('postclear-prelude/'))await archive('prelude');else if(w.at.startsWith('postclear-first/'))await archive('first');else if(w.at.startsWith('postclear-third/'))await archive('third');else if(w.at.startsWith('postclear-fourth/'))await archive('fourth');core.accept({type:isTextComplete(s.text!)||isTextConfirming(s.text!)?'advance':'reveal',prompt:w.prompt,inputId:'postclear-main-'+ ++input});
  }else if(w.kind==='group'||w.kind==='delay'){const ids=w.kind==='delay'?[w.task]:s.groups.find(g=>g.id===w.group)!.members;core.accept({type:'tick',ms:Math.max(1,...ids.flatMap(id=>{const t=s.tasks.find(t=>t.id===id);return t?.status==='running'?[t.duration-t.elapsed]:[];}))});}
  else if(w.kind==='media'){const t=s.tasks.find(t=>t.id===w.task)!;core.accept({type:'media.ended',task:t.id,attempt:t.attempt!});}else if(w.kind==='flush')core.accept({type:'flushAck',revision:v.profile.revision});else throw new Error('POSTCLEAR_MAIN_INPUT '+w.kind);
  requireValue(turn<99999,'POSTCLEAR_MAIN_LIMIT');
 }
 requireValue(enteredFifth&&questions===4&&maid===10,'POSTCLEAR_MAIN_END');for(const key of ['fataend_scenario1','fataend_scenario2','fataend_scenario3','fataend_scenario4','fataend_search'])requireValue(core.view().profile.values['original.'+key]?.value===true,'POSTCLEAR_MAIN_FLAG '+key);const departed=core.view().profile.values['original.FATAMORGANA_DEPARTED']?.value===true;requireValue(departed===(profile.values['original.FATAMORGANA_DEPARTED']?.value===true),'POSTCLEAR_NO_EARLY_DEPARTED');const current=new Set(core.view().profile.read);requireValue(profile.read.every(v=>current.has(v)),'POSTCLEAR_MAIN_OLD_READ');const report={locale,profileLocale,sdk,release:source.release,enteredFifth,questions,maid,menus,choices,textParts:text.size,soulPrompts:soul,cuts:[...cuts],oldReadKept:profile.read.length,newRead:current.size,departed,departedCheckAt:'scenario9',maxObjects,maxTasks,loadedModules:source.loaded().length,catalogModules:manifest.modules.length,completed:true,scope:profileLocale===locale?'actual completed-profile new game through all cleared pre-fifth normal route and earned memories; bad endings and source-native pixel comparison remain separate':'source-profile fixture from recorded Chinese completion; localized cleared pre-fifth normal route and earned memories, not cumulative all-ending proof'};await mkdir('artifacts/postclear-connected',{recursive:true});await writeFile(`artifacts/postclear-connected/${locale}-verified.json`,JSON.stringify(report,null,2));console.log(report);
}
