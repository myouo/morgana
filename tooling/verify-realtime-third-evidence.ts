import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {decodeWire} from 'galbox-sdk/wire';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
const root='generated/postclear-third-realtime',rows=[];
for(const locale of languages){
 const source=createModuleProgram(decodeWire('ModuleManifest',new Uint8Array(await readFile(`${root}/programs/${locale}.modules.pb`)))),compiled=JSON.parse(await readFile(`artifacts/realtime-postclear-door3/${locale}-compile.json`,'utf8')),runtime=JSON.parse(await readFile(`artifacts/realtime-postclear-door3/${locale}-runtime.json`,'utf8'));requireValue(compiled.release===source.release&&runtime.completed===true&&runtime.textParts===compiled.textParts&&runtime.cuts?.includes('raster-film')&&runtime.cuts.includes('raster-accumulate'),'REALTIME_THIRD_RUNTIME '+locale);
 for(const cut of runtime.cuts){requireValue(typeof cut==='string'&&/^[a-z-]+$/u.test(cut),'REALTIME_THIRD_CUT');const backup=decodeWire('PortableBackup',new Uint8Array(await readFile(`${root}/cuts/${locale}-${cut}.pb`)));requireValue(backup.release===source.release&&backup.slots.length===1,'REALTIME_THIRD_CUT_RELEASE');source.binding(backup.slots[0]!.snapshot);}
 rows.push({locale,release:source.release,textParts:runtime.textParts,cuts:runtime.cuts.length,completed:true});
}
await mkdir('artifacts/realtime-postclear-door3',{recursive:true});await writeFile('artifacts/realtime-postclear-door3/evidence.json',JSON.stringify({rows,scope:'full Core report matched to current compiler and every archived source-bound cold cut; physical browser and original pixel certification remain separate'},null,2));console.log(rows);
