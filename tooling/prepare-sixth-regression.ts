import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {MemoryStore} from 'galbox-sdk/testing';
import {storageNamespace} from 'galbox-sdk/backups';
import {migrateSearch} from '../src/search-migration.js';
import {expandLeafPlan} from '../src/leaf-plan.js';
import {requireValue} from './kag.js';
const root='generated/sixth-connected',previous='generated/fifth-public',read=async(p:string)=>new Uint8Array(await readFile(p));
for(const locale of ['en','zh']){
 const source=createModuleProgram(decodeWire('ModuleManifest',await read(`${previous}/programs/${locale}.modules.pb`))),target=createModuleProgram(decodeWire('ModuleManifest',await read(`${root}/programs/${locale}.modules.pb`))),backup=decodeWire('PortableBackup',await read(`artifacts/fifth-connected/regression-cuts/${locale}-badend.pb`)),cut=backup.slots[0]!.snapshot,profile=backup.profiles[0]!.profile;
 source.binding(cut);const canonical=source.bindSnapshot(cut);source.installAll(await Promise.all(source.binding(canonical).map(async id=>decodeWire('ProgramModule',await read(previous+'/'+source.descriptor(id).uri)))));createCore(source,profile,canonical);target.installAll(await Promise.all(target.describe().modules.map(async m=>decodeWire('ProgramModule',await read(root+'/'+m.uri)))));
 const meta=decodeWire('JsonValue',await read(`${root}/programs/${locale}.title.pb`));requireValue(meta&&typeof meta==='object'&&!Array.isArray(meta)&&meta.moduleMigration&&typeof meta.moduleMigration==='object'&&!Array.isArray(meta.moduleMigration),'SIXTH_REGRESSION_META');const ref=meta.moduleMigration.leafPlan;requireValue(ref&&typeof ref==='object'&&!Array.isArray(ref)&&typeof ref.path==='string','SIXTH_REGRESSION_PLAN');const mapped=migrateSearch(canonical,target.program(target.loaded()),target,'frames',expandLeafPlan(decodeWire('JsonValue',await read(root+'/'+ref.path))));createCore(target,profile,mapped);requireValue(mapped.status==='ended'&&mapped.frames[0]?.pc==='release:return-title','SIXTH_REGRESSION_BADEND');
 const manifest=target.describe(),store=new MemoryStore(storageNamespace(manifest.header.gameId,manifest.release.series),profile);await store.save('source-cut',mapped,0,{profileId:'main',label:'source bad ending'});await mkdir('artifacts/sixth-connected/regression-cuts',{recursive:true});await writeFile(`artifacts/sixth-connected/regression-cuts/${locale}-badend.pb`,encodeWire('PortableBackup',await store.backup(manifest.header.gameId,manifest.release.series,target.release)));console.log({locale,badEndingRebound:true,release:target.release});
}
