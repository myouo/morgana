import {readFile,writeFile,mkdir,cp,copyFile,readdir,rename} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import {decodeWire} from 'galbox-sdk/wire';
import {languages,hash} from './locale.js';
import {publicationAssets} from './publication-assets.js';
import {requireValue} from './kag.js';

const source='generated/native-connected',stage='generated/native-public',destination='generated/integrated';
const read=async(p:string)=>new Uint8Array(await readFile(p)),json=async(p:string)=>JSON.parse(await readFile(p,'utf8'));
const promote=process.argv[2]==='--promote';requireValue(process.argv.length===2||promote&&process.argv.length===3,'NATIVE_STAGE_ARGUMENT');
const releases=new Map<string,string>();
for(const locale of languages){
 const manifest=decodeWire('ModuleManifest',await read(`${source}/programs/${locale}.modules.pb`)),report=await json(`artifacts/native-connected/${locale}-verified.json`),compiled=await json(`artifacts/native-connected/${locale}-compile.json`);
 requireValue(report.release===manifest.header.release&&compiled.release===report.release&&report.completed===true&&report.authority==='single-main-program','NATIVE_STAGE_CORE '+locale);
 requireValue(report.rows?.length===12&&report.rows.every((r:{cold?:boolean})=>r.cold===true)&&report.rows.find((r:{id:string})=>r.id==='prologue')?.continued===true&&report.previousPages?.length===2&&report.titleCutMigration===true,'NATIVE_STAGE_ENTRIES '+locale);
 if(['zh','en'].includes(locale))requireValue(report.endpointHandoffs?.length===2,'NATIVE_STAGE_HANDOFFS '+locale);
 const prior=decodeWire('ModuleManifest',await read(`generated/ninth-connected/programs/${locale}.modules.pb`));requireValue(compiled.source===prior.header.release,'NATIVE_STAGE_SOURCE '+locale);
 // Native entry checks augment the existing whole-chapter route checks.
 for(const [number,artifact]of [[8,'door8'],[9,'door9']]as const){const donor=decodeWire('ModuleManifest',await read(`generated/door${number}-full/programs/${locale}.modules.pb`)),result=await json(`artifacts/${artifact}/${locale}-runtime.json`);requireValue(result.completed===true&&result.release===donor.header.release,'NATIVE_STAGE_DONOR '+number+'/'+locale);}
 releases.set(locale,manifest.header.release);
}
const browser=await json('artifacts/native-connected/local-browser.json');requireValue(browser.stats?.expected===3&&browser.stats?.unexpected===0&&browser.stats?.skipped===0,'NATIVE_STAGE_BROWSER');
let browserTests=0;
function checkSuites(suites:typeof browser.suites){for(const suite of suites??[]){for(const spec of suite.specs??[])for(const t of spec.tests??[]){requireValue(t.status==='expected'&&[...(t.annotations??[]),...(t.results??[]).flatMap((r:{annotations?:{type:string;description:string}[]})=>r.annotations??[])].some((a:{type:string;description:string})=>a.type==='release'&&a.description===releases.get('zh')),'NATIVE_STAGE_BROWSER_RELEASE');browserTests++;}checkSuites(suite.suites);}}
checkSuites(browser.suites);requireValue(browserTests===3,'NATIVE_STAGE_BROWSER_COUNT');
const assets=await publicationAssets(source);await mkdir(stage,{recursive:true});for(const entry of await readdir(stage))requireValue(['programs','text','compat','assets'].includes(entry),'NATIVE_STAGE_UNEXPECTED '+entry);
for(const dir of ['programs','text','compat'])await cp(source+'/'+dir,stage+'/'+dir,{recursive:true});
for(const asset of assets){await mkdir(path.dirname(stage+'/'+asset.key),{recursive:true});await copyFile(source+'/'+asset.key,stage+'/'+asset.key);requireValue(hash(await read(stage+'/'+asset.key))===asset.sha256,'NATIVE_STAGE_SHA');}
const result={languages:8,objects:assets.length,bytes:assets.reduce((n,a)=>n+a.bytes,0),testCutsIncluded:0,root:stage,promoted:false};
if(promote){
 const mutable=new Set(['text/locales.pb',...languages.flatMap(locale=>[`programs/${locale}.modules.pb`,`programs/${locale}.title.pb`,`text/${locale}.ui.pb`])]);
 async function append(dir:string){for(const entry of await readdir(stage+'/'+dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory()){await append(file);continue;}if(mutable.has(file))continue;await mkdir(path.dirname(destination+'/'+file),{recursive:true});try{await copyFile(stage+'/'+file,destination+'/'+file,constants.COPYFILE_EXCL);}catch(error){if(!error||typeof error!=='object'||!('code'in error)||error.code!=='EEXIST')throw error;requireValue(hash(await read(stage+'/'+file))===hash(await read(destination+'/'+file)),'NATIVE_PROMOTE_IMMUTABLE '+file);}}}
 for(const dir of ['assets','programs','text','compat'])await append(dir);
 for(const file of [...mutable].sort((a,b)=>Number(a.endsWith('.modules.pb'))-Number(b.endsWith('.modules.pb')))){await mkdir(path.dirname(destination+'/'+file),{recursive:true});await writeFile(destination+'/'+file+'.next',await read(stage+'/'+file));await rename(destination+'/'+file+'.next',destination+'/'+file);}
 result.promoted=true;
}
await writeFile('artifacts/native-connected/'+(promote?'promoted':'staged')+'.json',JSON.stringify(result,null,2));console.log(result);
