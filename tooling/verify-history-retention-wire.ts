import {readFile,writeFile} from 'node:fs/promises';import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {sdkProvenance} from './sdk-provenance.js';import {languages,hash} from './locale.js';import {requireValue} from './kag.js';
// The candidate was compiled before the storage-only SDK upgrade. Keep that
// provenance, and check every unchanged wire document with the actual new pack.
const root='generated/history-retention',read=async(file:string)=>new Uint8Array(await readFile(file)),sdk=await sdkProvenance();
for(const locale of languages){
 const report=JSON.parse(await readFile(`artifacts/history-retention/${locale}-compile.json`,'utf8')),manifestBytes=await read(`${root}/programs/${locale}.modules.pb`),manifest=decodeWire('ModuleManifest',manifestBytes),title=await read(`${root}/programs/${locale}.title.pb`);requireValue(hash(manifestBytes)===report.manifestSha256&&hash(title)===report.titleSha256,'RETENTION_WIRE_CANDIDATE');requireValue(hash(encodeWire('ModuleManifest',manifest))===hash(manifestBytes)&&hash(encodeWire('JsonValue',decodeWire('JsonValue',title)))===hash(title),'RETENTION_WIRE_METADATA');let modules=0;
 for(const module of manifest.modules){const bytes=await read(root+'/'+module.uri);requireValue(hash(bytes)===module.sha256&&bytes.length===module.bytes&&hash(encodeWire('ProgramModule',decodeWire('ProgramModule',bytes)))===module.sha256,'RETENTION_WIRE_MODULE');modules++;}
 await writeFile(`artifacts/history-retention/${locale}-wire.json`,JSON.stringify({locale,release:manifest.header.release,manifestSha256:hash(manifestBytes),titleSha256:hash(title),modules,producerSdk:report.sdk,sdk,completed:true,byteIdentical:true},null,2));console.log({locale,modules,byteIdentical:true});
}
