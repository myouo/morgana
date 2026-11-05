import {readFile,writeFile,mkdir,cp,copyFile,readdir,rename} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import {decodeWire} from 'galbox-sdk/wire';
import {languages,hash} from './locale.js';
import {publicationAssets} from './publication-assets.js';
import {sdkProvenance} from './sdk-provenance.js';
import {requireValue} from './kag.js';

const source='generated/realtime-cleared-connected',stage='generated/realtime-cleared-public',destination='generated/integrated',sdk=await sdkProvenance(),promote=process.argv.includes('--promote');
requireValue(process.argv.slice(2).every(arg=>arg==='--promote'),'REALTIME_STAGE_ARGUMENT');
const read=async(p:string)=>new Uint8Array(await readFile(p)),json=async(p:string)=>JSON.parse(await readFile(p,'utf8')),base=await json('artifacts/postclear-fixed/promoted.json'),evidence=await json('artifacts/realtime-postclear-door3/evidence.json'),releases=new Map<string,string>();
requireValue(base.promoted===true&&base.sdk?.sha256===sdk.sha256,'REALTIME_STAGE_BASE');
for(const locale of languages){
 const manifest=decodeWire('ModuleManifest',await read(`${source}/programs/${locale}.modules.pb`)),release=manifest.header.release,prior=decodeWire('ModuleManifest',await read(`generated/postclear-fixed/programs/${locale}.modules.pb`)),compiled=await json(`artifacts/realtime-cleared-connected/${locale}-compile.json`),delta=await json(`artifacts/realtime-cleared-connected/${locale}-delta.json`),native=await json(`artifacts/realtime-cleared-connected/${locale}-native-regression.json`),upgrades=await json(`artifacts/realtime-cleared-connected/${locale}-old-upgrades.json`);
 requireValue(base.releases?.[locale]===prior.header.release&&compiled.source===prior.header.release&&compiled.release===release,'REALTIME_STAGE_PARENT '+locale);
 requireValue(delta.completed===true&&delta.source===prior.header.release&&delta.release===release&&delta.unchangedFunctions>1000&&delta.oldResourcesRetained===true&&delta.writers?.length>1&&delta.imageAliases?.length===4,'REALTIME_STAGE_DELTA '+locale);
 requireValue(evidence.rows?.some((r:{locale:string;release:string;completed:boolean;cuts:number})=>r.locale===locale&&r.release===compiled.donor&&r.completed===true&&r.cuts===8),'REALTIME_STAGE_DONOR '+locale);
 requireValue(native.release===release&&native.completed===true&&native.authority==='single-main-program'&&native.rows?.length===12&&native.rows.every((r:{cold:boolean;bgmGain:number})=>r.cold===true&&r.bgmGain===1)&&native.rows.find((r:{id:string})=>r.id==='prologue')?.continued===true&&native.thirdHandoff===true&&native.thirdTextWaits>1000&&native.previousPages?.length===2&&native.titleCutMigration===true,'REALTIME_STAGE_NATIVE '+locale);
 requireValue(upgrades.release===release&&upgrades.completed===true&&upgrades.rows?.length===4&&upgrades.rows.every((r:{target:string;completed:boolean;frames:number})=>r.target===release&&r.completed===true&&r.frames===4),'REALTIME_STAGE_UPGRADES '+locale);
 if(['zh','en'].includes(locale))requireValue(native.endpointHandoffs?.length===2,'REALTIME_STAGE_LATE_HANDOFF '+locale);
 releases.set(locale,release);
}
const browser=await json('artifacts/realtime-cleared-connected/browser.json');requireValue(browser.stats?.expected===6&&browser.stats?.unexpected===0&&browser.stats?.skipped===0,'REALTIME_STAGE_BROWSER');let tested=0;
function visit(suites:typeof browser.suites){for(const suite of suites??[]){for(const spec of suite.specs??[])for(const test of spec.tests??[]){const annotations=[...(test.annotations??[]),...(test.results??[]).flatMap((r:{annotations?:{type:string;description:string}[]})=>r.annotations??[])];requireValue(test.status==='expected'&&annotations.some((a:{type:string;description:string})=>a.type==='release'&&a.description===releases.get('zh'))&&annotations.some((a:{type:string;description:string})=>a.type==='sdk'&&a.description===sdk.sha256),'REALTIME_STAGE_BROWSER_IDENTITY');tested++;}visit(suite.suites);}}
visit(browser.suites);requireValue(tested===6,'REALTIME_STAGE_BROWSER_COUNT');
const assets=await publicationAssets(source);await mkdir(stage,{recursive:true});for(const entry of await readdir(stage))requireValue(['programs','text','compat','assets'].includes(entry),'REALTIME_STAGE_UNEXPECTED '+entry);
for(const dir of ['programs','text','compat'])await cp(source+'/'+dir,stage+'/'+dir,{recursive:true});for(const asset of assets){await mkdir(path.dirname(stage+'/'+asset.key),{recursive:true});await copyFile(source+'/'+asset.key,stage+'/'+asset.key);requireValue(hash(await read(stage+'/'+asset.key))===asset.sha256,'REALTIME_STAGE_SHA');}
const result={releases:Object.fromEntries(releases),sdk,objects:assets.length,bytes:assets.reduce((n,a)=>n+a.bytes,0),testCutsIncluded:0,root:stage,promoted:false,proofSource:'published fixed parent plus exact third-door-only delta; full eight-language donor, native third-to-investigation handoff and old-cut migration; six Canvas/WebGL save-refresh cases',scope:'main program composition and registered saved-slot compatibility; old assets retained; original pixel matching and remaining replica gaps stay separate'};
if(promote){
 const mutable=new Set(['text/locales.pb',...languages.flatMap(locale=>[`programs/${locale}.modules.pb`,`programs/${locale}.title.pb`,`text/${locale}.ui.pb`])]);
 async function append(dir:string){for(const entry of await readdir(stage+'/'+dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory()){await append(file);continue;}if(mutable.has(file))continue;await mkdir(path.dirname(destination+'/'+file),{recursive:true});try{await copyFile(stage+'/'+file,destination+'/'+file,constants.COPYFILE_EXCL);}catch(error){if(!error||typeof error!=='object'||!('code'in error)||error.code!=='EEXIST')throw error;requireValue(hash(await read(stage+'/'+file))===hash(await read(destination+'/'+file)),'REALTIME_PROMOTE_IMMUTABLE '+file);}}}
 for(const dir of ['assets','programs','text','compat'])await append(dir);for(const file of [...mutable].sort((a,b)=>Number(a.endsWith('.modules.pb'))-Number(b.endsWith('.modules.pb')))){await mkdir(path.dirname(destination+'/'+file),{recursive:true});await writeFile(destination+'/'+file+'.next',await read(stage+'/'+file));await rename(destination+'/'+file+'.next',destination+'/'+file);}result.promoted=true;
}
await writeFile(`artifacts/realtime-cleared-connected/${promote?'promoted':'staged'}.json`,JSON.stringify(result,null,2));console.log(result);
