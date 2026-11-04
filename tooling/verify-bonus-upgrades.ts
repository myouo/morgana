import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {isDeepStrictEqual} from 'node:util';
import {createCore} from 'galbox-sdk/core';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {migrateSearch} from '../src/search-migration.js';
import {expandLeafPlan} from '../src/leaf-plan.js';
import {installModuleFiles} from './install-module-files.js';
import {hash,languages} from './locale.js';
import {requireValue} from './kag.js';

const from='generated/native-connected',to=process.env.FATA_UPGRADE_ROOT??'generated/bonus-connected',read=async(p:string)=>new Uint8Array(await readFile(p));
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh,en').split(',').includes(l))){
 const oldBytes=await read(`${from}/programs/${locale}.modules.pb`),old=createModuleProgram(decodeWire('ModuleManifest',oldBytes)),manifest=decodeWire('ModuleManifest',await read(`${to}/programs/${locale}.modules.pb`)),next=createModuleProgram(manifest),files=new Map(await Promise.all(manifest.modules.map(async m=>[m.id,decodeWire('ProgramModule',await read(to+'/'+m.uri))]as const)));installModuleFiles(next,[...files.values()]);
 const snapshot=decodeWire('Snapshot',await read(`${from}/cuts/${locale}-native-door9.snapshot.pb`)),profile=decodeWire('Profile',await read(`${from}/cuts/${locale}-native-door9.profile.pb`)),canonical=old.bindSnapshot(snapshot);installModuleFiles(old,await Promise.all(old.binding(canonical).map(async id=>decodeWire('ProgramModule',await read(from+'/'+old.descriptor(id).uri)))));createCore(old,profile,canonical);
 const meta=decodeWire('JsonValue',await read(`${to}/programs/${locale}.title.pb`));requireValue(meta&&typeof meta==='object'&&!Array.isArray(meta)&&Array.isArray(meta.moduleSources),'BONUS_UPGRADE_METADATA');const row=meta.moduleSources.find(r=>r&&typeof r==='object'&&!Array.isArray(r)&&r.release===old.release);requireValue(row&&typeof row==='object'&&!Array.isArray(row)&&row.sha256===hash(oldBytes)&&typeof row.path==='string'&&hash(await read(to+'/'+row.path))===row.sha256&&row.migration==='search'&&row.searchBase==='frames'&&row.leafPlan&&typeof row.leafPlan==='object'&&!Array.isArray(row.leafPlan)&&typeof row.leafPlan.path==='string','BONUS_UPGRADE_SOURCE');
 const mapped=migrateSearch(canonical,next.program(next.loaded()),next,'frames',expandLeafPlan(decodeWire('JsonValue',await read(to+'/'+row.leafPlan.path)))),core=createCore(next,profile,mapped),cut=core.capture();requireValue(isDeepStrictEqual(cut.frames,mapped.frames)&&isDeepStrictEqual(cut.text,snapshot.text)&&isDeepStrictEqual(core.view().profile.read,profile.read)&&isDeepStrictEqual(core.view().profile.values,profile.values)&&cut.audioState?.gains.bgm===1,'BONUS_UPGRADE_PROGRESS');
 const cold=createModuleProgram(manifest);installModuleFiles(cold,cold.binding(cut).map(id=>files.get(id)!));const restored=createCore(cold,core.view().profile,decodeWire('Snapshot',encodeWire('Snapshot',cut))).capture();requireValue(isDeepStrictEqual(restored.frames,cut.frames)&&isDeepStrictEqual(restored.stage,cut.stage)&&isDeepStrictEqual(restored.text,cut.text),'BONUS_UPGRADE_COLD');
 await mkdir(to.replace('generated/','artifacts/'),{recursive:true});const report={locale,from:old.release,to:next.release,read:profile.read.length,oldNativeCut:true,cold:true,completed:true};await writeFile(`${to.replace('generated/','artifacts/')}/${locale}-upgrade.json`,JSON.stringify(report,null,2));console.log(report);
}
