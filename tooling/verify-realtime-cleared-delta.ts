import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {decodeWire} from 'galbox-sdk/wire';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {canonicalWireJSON} from 'galbox-sdk/protocol';
import {checkRasterFunctions} from './check-raster-upgrade.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
const read=async(p:string)=>new Uint8Array(await readFile(p)),prefix='postclear-third/';
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 async function load(root:string){const source=createModuleProgram(decodeWire('ModuleManifest',await read(`${root}/programs/${locale}.modules.pb`))),manifest=source.describe(),functions=(await Promise.all(manifest.modules.map(async m=>decodeWire('ProgramModule',await read(root+'/'+m.uri))))).flatMap(m=>m.functions);return {source,manifest,functions};}
 const before=await load('generated/postclear-fixed'),after=await load('generated/realtime-cleared-connected'),current=new Map(after.functions.map(f=>[f.id,f]));let unchanged=0;
 for(const fn of before.functions)if(!fn.id.startsWith(prefix)){requireValue(canonicalWireJSON(fn)===canonicalWireJSON(current.get(fn.id)),'REALTIME_DELTA_OTHER '+fn.id);unchanged++;}
 requireValue(before.functions.length===after.functions.length,'REALTIME_DELTA_FUNCTION_COUNT');
 const checked=checkRasterFunctions(before.functions.filter(f=>f.id.startsWith(prefix)),after.functions.filter(f=>f.id.startsWith(prefix)));for(const a of before.source.catalog()){const current=after.source.catalog().find(b=>b.id===a.id);requireValue(current&&canonicalWireJSON(current)===canonicalWireJSON(a),'REALTIME_DELTA_RETAINED_ASSET '+a.id);}
 for(const key of ['globals','ui','extras','textLayout','textStyles','bgmBuffers','sfxBuffers']as const)requireValue(canonicalWireJSON(before.manifest.header[key]??null)===canonicalWireJSON(after.manifest.header[key]??null),'REALTIME_DELTA_HEADER '+key);
 const report={locale,source:before.source.release,release:after.source.release,unchangedFunctions:unchanged,writers:checked.requiredFunctions,imageAliases:checked.imageAliases,oldResourcesRetained:true,completed:true,scope:'all functions outside cleared third and all old resource bytes/contracts unchanged; cleared third only checked same-address procedural/filter replacements'};await mkdir('artifacts/realtime-cleared-connected',{recursive:true});await writeFile(`artifacts/realtime-cleared-connected/${locale}-delta.json`,JSON.stringify(report,null,2));console.log(report);
}
