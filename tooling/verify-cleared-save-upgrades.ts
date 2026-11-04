import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import {createCore} from 'galbox-sdk/core';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {moduleSaveSources} from '../src/legacy-sources.js';
import {migrateSearch} from '../src/search-migration.js';
import {expandLeafPlan} from '../src/leaf-plan.js';
import {installModuleFiles} from './install-module-files.js';
import {languages,hash} from './locale.js';
import {requireValue} from './kag.js';

const root=process.env.FATA_CLEARED_ROOT??'generated/postclear-connected',read=async(p:string)=>new Uint8Array(await readFile(p));
for(const locale of languages.filter(l=>(process.argv[2]??'zh,en').split(',').includes(l))){
 const manifest=decodeWire('ModuleManifest',await read(`${root}/programs/${locale}.modules.pb`)),source=createModuleProgram(manifest),files=new Map(await Promise.all(manifest.modules.map(async m=>[m.id,decodeWire('ProgramModule',await read(root+'/'+m.uri))]as const)));
 installModuleFiles(source,[...files.values()]);const target=source.program(source.loaded()),meta=decodeWire('JsonValue',await read(`${root}/programs/${locale}.title.pb`));requireValue(meta&&typeof meta==='object'&&!Array.isArray(meta),'CLEARED_UPGRADE_META');const sources=moduleSaveSources(meta.moduleSources),rows=[];
 for(const name of ['search-questions','search-key','search-places','search-final-choice']){
  const backup=decodeWire('PortableBackup',await read(`generated/search-connected/cuts/${locale}-remember-take-${name}.pb`)),snapshot=backup.slots[0]!.snapshot,profile=backup.profiles[0]!.profile,row=sources.find(r=>r.release===snapshot.release);requireValue(row?.migration==='search'&&row.leafPlan,'CLEARED_UPGRADE_SOURCE');const bytes=await read(root+'/'+row.path);requireValue(hash(bytes)===row.sha256,'CLEARED_UPGRADE_DIGEST');const old=createModuleProgram(decodeWire('ModuleManifest',bytes));installModuleFiles(old,await Promise.all(old.binding(snapshot).map(async id=>decodeWire('ProgramModule',await read(root+'/'+old.descriptor(id).uri)))));createCore(old,profile,snapshot);
  const planBytes=await read(root+'/'+row.leafPlan.path);requireValue(hash(planBytes)===row.leafPlan.sha256,'CLEARED_UPGRADE_PLAN');const mapped=migrateSearch(snapshot,target,source,row.searchBase??'frames',expandLeafPlan(decodeWire('JsonValue',planBytes)),undefined,row.imageAliases??[]),core=createCore(source,profile,mapped),actual=core.capture();
  for(const key of ['frames','text']as const)requireValue(isDeepStrictEqual(actual[key],snapshot[key]),'CLEARED_UPGRADE_STATE '+name+':'+key);
  requireValue(isDeepStrictEqual(actual.ui?.active,snapshot.ui?.active)&&actual.ui?.signature===createCore(source).view().run.ui?.signature,'CLEARED_UPGRADE_UI_STATE '+name);
  const cold=createModuleProgram(manifest);installModuleFiles(cold,cold.binding(actual).map(id=>files.get(id)!));const restored=createCore(cold,core.view().profile,decodeWire('Snapshot',encodeWire('Snapshot',actual))).capture();requireValue(isDeepStrictEqual(restored.ui,actual.ui)&&isDeepStrictEqual(restored.stage,actual.stage)&&isDeepStrictEqual(restored.frames,actual.frames),'CLEARED_UPGRADE_COLD '+name);
  const wait=actual.wait,control=actual.ui?.active?.screen.controls.find(c=>c.visible&&c.enabled);requireValue(wait?.kind==='ui'&&control,'CLEARED_UPGRADE_UI');const identity={prompt:wait.prompt,attempt:wait.attempt,generation:wait.generation};core.accept({type:'ui.activate',...identity});core.accept({type:'ui.click',...identity,control:control.id,inputId:'cleared-upgrade-'+name});for(let n=0;n<2000;n++){core.run(100);core.drainEffects();requireValue(core.view().run.status!=='failed','CLEARED_UPGRADE_CONTINUE');if(core.view().run.wait?.kind!=='ui'||core.view().run.wait?.at!==wait.at)break;requireValue(n<1999,'CLEARED_UPGRADE_STUCK');}
  requireValue(profile.read.every(id=>core.view().profile.read.includes(id)),'CLEARED_UPGRADE_READ');rows.push({name,source:row.release,screen:wait.screen,cold:true,continued:true,oldRead:profile.read.length});console.log({locale,...rows.at(-1)});
 }
 const reportRoot=root.replace('generated/','artifacts/');await mkdir(reportRoot,{recursive:true});await writeFile(`${reportRoot}/${locale}-search-upgrades.json`,JSON.stringify({locale,release:source.release,rows,completed:true,scope:'four real ordinary investigation UI saves migrate and cold restore after adding separate cleared menus; all original installed-game saves remain a separate scope'},null,2));
}
