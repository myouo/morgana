import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createCore} from 'galbox-sdk/core';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {MemoryStore} from 'galbox-sdk/testing';
import {storageNamespace} from 'galbox-sdk/backups';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import {migrateSearch} from '../src/search-migration.js';
import {expandLeafPlan} from '../src/leaf-plan.js';
import {requireValue} from './kag.js';

const root='generated/interfaces-shared',oldRoot='generated/release-public',read=async(file:string)=>new Uint8Array(await readFile(file));
for(const locale of ['en','zh']){const source=createModuleProgram(decodeWire('ModuleManifest',await read(`${oldRoot}/programs/${locale}.modules.pb`))),target=createModuleProgram(decodeWire('ModuleManifest',await read(`${root}/programs/${locale}.modules.pb`)));for(const [s,r]of [[source,oldRoot],[target,root]]as const)s.installAll(await Promise.all(s.describe().modules.map(async m=>decodeWire('ProgramModule',await read(r+'/'+m.uri)))));
 const old=decodeWire('PortableBackup',await read(`generated/release-next/cuts/${locale}-badend.pb`)),slot=old.slots[0],profile=old.profiles[0]?.profile;requireValue(slot&&profile,'INTERFACE_CUT_SOURCE');createCore(source,profile,slot.snapshot);const meta=decodeWire('JsonValue',await read(`${root}/programs/${locale}.title.pb`));requireValue(meta&&typeof meta==='object'&&!Array.isArray(meta),'INTERFACE_CUT_META');const migration=meta.moduleMigration;requireValue(migration&&typeof migration==='object'&&!Array.isArray(migration)&&migration.leafPlan&&typeof migration.leafPlan==='object'&&!Array.isArray(migration.leafPlan)&&typeof migration.leafPlan.path==='string','INTERFACE_CUT_PLAN');const plan=expandLeafPlan(decodeWire('JsonValue',await read(root+'/'+migration.leafPlan.path))),mapped=migrateSearch(slot.snapshot,target.program(target.loaded()),target,'frames',plan),core=createCore(target,profile,mapped),store=new MemoryStore(storageNamespace(target.describe().header.gameId,target.describe().release.series),core.view().profile);await store.save('cut',core.capture(),0,{profileId:'main',label:'source bad ending'});await mkdir(root+'/cuts',{recursive:true});await writeFile(`${root}/cuts/${locale}-badend.pb`,encodeWire('PortableBackup',await store.backup(target.describe().header.gameId,target.describe().release.series,target.release)));console.log({locale,release:target.release,sourceValidated:true,targetValidated:true});}
