import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import type {ModuleProgram} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {decodeWire} from 'galbox-sdk/wire';
import {moduleSaveSources} from '../src/legacy-sources.js';
import {migrationCodeIndex} from '../src/migration-code-plan.js';
import {expandLeafPlan} from '../src/leaf-plan.js';
import {migrateSearch} from '../src/search-migration.js';
import {languages} from './locale.js';
const root='generated/integrated',read=async(file:string)=>new Uint8Array(await readFile(file));
async function load(source:ModuleProgram,ids:readonly string[]){const wanted=new Set<string>();function visit(id:string){if(source.has(id)||wanted.has(id))return;wanted.add(id);for(const dep of source.descriptor(id).dependencies??[])visit(dep);}ids.forEach(visit);source.installAll(await Promise.all([...wanted].map(async id=>decodeWire('ProgramModule',await read(root+'/'+source.descriptor(id).uri)))));}
const reports=[];
for(const locale of languages.filter(l=>process.argv[2]==='all'||l===(process.argv[2]??'zh'))){
 const manifest=decodeWire('ModuleManifest',await read(`${root}/programs/${locale}.modules.pb`)),meta=decodeWire('JsonValue',await read(`${root}/programs/${locale}.title.pb`));assert.ok(meta&&typeof meta==='object'&&!Array.isArray(meta));const sources=moduleSaveSources(meta.moduleSources),cache=new Map<string,ModuleProgram>(),rows=[];
 for(const directory of ['integration/cuts','connection/cuts','procedural/cuts','procedural/frame-cuts','heartbeat/cuts','fourth/cuts','search/cuts','interactions/cuts'])for(const file of await readdir('artifacts/'+directory).catch(()=>[])){
  if(!file.startsWith(locale+'-')||!file.endsWith('.pb'))continue;const backup=decodeWire('PortableBackup',await read('artifacts/'+directory+'/'+file)),cut=backup.slots[0]!.snapshot,row=sources.find(s=>s.release===cut.release);if(!row||row.migration!=='search'||!row.leafPlan)continue;
  const original=JSON.stringify(cut);let source=cache.get(row.release);if(!source){source=createModuleProgram(decodeWire('ModuleManifest',await read(root+'/'+row.path)));cache.set(row.release,source);}source.binding(cut);const canonical=source.bindSnapshot(cut);await load(source,source.binding(canonical));createCore(source,backup.profiles[0]!.profile,canonical);
  const target=createModuleProgram(manifest),plan=expandLeafPlan(decodeWire('JsonValue',await read(root+'/'+row.leafPlan.path))),wanted=migrationCodeIndex(target.declarations())(canonical,plan,row.imageAliases??[]);await load(target,wanted.map(id=>target.moduleForFunction(id)));const mapped=migrateSearch(canonical,target.program(target.loaded()),target,row.searchBase??'frames',plan,undefined,row.imageAliases??[]),actual=createCore(target,backup.profiles[0]!.profile,mapped).capture();assert.deepEqual(actual.frames,cut.frames,file);assert.deepEqual(actual.text,cut.text,file);for(const task of cut.tasks){const next=actual.tasks.find(t=>t.id===task.id);assert.ok(next,file);assert.equal(next.elapsed,task.elapsed,file);assert.equal(next.duration,task.duration,file);}assert.equal(JSON.stringify(cut),original);rows.push({cut:directory+'/'+file,modules:target.loaded().length,bytes:target.loaded().reduce((n,id)=>n+target.descriptor(id).bytes,0)});
 }
 assert.ok(rows.length>=8,locale+' requires real historical cuts');reports.push({locale,rows});console.log({locale,cuts:rows.length,maxModules:Math.max(...rows.map(r=>r.modules))});
}
await mkdir('artifacts/load-profile',{recursive:true});await writeFile('artifacts/load-profile/scoped-cuts.json',JSON.stringify(reports,null,2));
