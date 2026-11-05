import {readFile,writeFile,mkdir,cp,copyFile,readdir,rename} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import {decodeWire} from 'galbox-sdk/wire';
import {languages,hash} from './locale.js';
import {publicationAssets} from './publication-assets.js';
import {sdkProvenance} from './sdk-provenance.js';
import {requireValue} from './kag.js';

const source='generated/postclear-connected',stage='generated/postclear-public',destination='generated/integrated',sdk=await sdkProvenance(),read=async(p:string)=>new Uint8Array(await readFile(p)),json=async(p:string)=>JSON.parse(await readFile(p,'utf8')),promote=process.argv[2]==='--promote';
requireValue(process.argv.length===2||promote&&process.argv.length===3,'POSTCLEAR_STAGE_ARGUMENT');
const releases=new Map<string,string>();
for(const locale of languages){
 const manifest=decodeWire('ModuleManifest',await read(`${source}/programs/${locale}.modules.pb`)),release=manifest.header.release,compiled=await json(`artifacts/postclear-connected/${locale}-compile.json`),base=decodeWire('ModuleManifest',await read(`generated/cleared-connected/programs/${locale}.modules.pb`));
 requireValue(compiled.release===release&&compiled.source===base.header.release&&compiled.donors?.length===6,'POSTCLEAR_STAGE_COMPILE '+locale);releases.set(locale,release);
 const preserved=await json(`artifacts/postclear-connected/${locale}-preservation.json`);requireValue(preserved.completed===true&&preserved.release===release&&preserved.source===base.header.release&&preserved.oldFunctions===base.functionOrder.length&&preserved.calls>5000&&preserved.oldScreens===11,'POSTCLEAR_STAGE_PRESERVATION '+locale);
 const native=await json(`artifacts/postclear-connected/${locale}-native-regression.json`);requireValue(native.release===release&&native.completed===true&&native.authority==='single-main-program'&&native.rows?.length===12&&native.rows.every((r:{cold?:boolean;bgmGain?:number})=>r.cold===true&&r.bgmGain===1)&&native.rows.find((r:{id:string})=>r.id==='prologue')?.continued===true&&native.previousPages?.length===2&&native.titleCutMigration===true,'POSTCLEAR_STAGE_NATIVE '+locale);
 const route=await json(`artifacts/postclear-connected/${locale}-verified.json`);requireValue(route.release===release&&route.completed===true&&route.enteredFifth===true&&route.questions===4&&route.maid===10&&route.departedCheckAt==='scenario9'&&route.departed===false&&route.cuts?.includes('fourth-gate')&&route.cuts.includes('fifth-entry'),'POSTCLEAR_STAGE_ROUTE '+locale);
 const bonus=await json(`artifacts/postclear-connected/${locale}-bonus-regression.json`);requireValue(bonus.release===release&&bonus.completed===true&&bonus.authority==='single-main-program'&&bonus.matrix?.length===9&&bonus.textParts>140&&bonus.cuts?.length===3&&bonus.replayed===true,'POSTCLEAR_STAGE_BONUS '+locale);
 // Existing complete menu and late-chapter proofs remain applicable because
 // preservation compares all their code/layout/assets, not just names.
 const menu=await json(`artifacts/cleared-connected/${locale}-verified.json`);requireValue(menu.completed===true&&menu.release===base.header.release,'POSTCLEAR_STAGE_MENU_BASE '+locale);
 for(const number of [8,9]){const chapter=decodeWire('ModuleManifest',await read(`generated/door${number}-full/programs/${locale}.modules.pb`)),tested=await json(`artifacts/door${number}/${locale}-runtime.json`);requireValue(tested.completed===true&&tested.release===chapter.header.release,'POSTCLEAR_STAGE_LATE_SOURCE '+number+'/'+locale);}
 if(['zh','en'].includes(locale)){
  requireValue(route.profileLocale===locale&&route.oldReadKept>32000&&native.endpointHandoffs?.length===2,'POSTCLEAR_STAGE_REAL_PROFILE '+locale);
  const upgrades=await json(`artifacts/postclear-connected/${locale}-search-upgrades.json`);requireValue(upgrades.release===release&&upgrades.completed===true&&upgrades.rows?.length===4&&upgrades.rows.every((r:{cold?:boolean;continued?:boolean})=>r.cold&&r.continued),'POSTCLEAR_STAGE_OLD_UI '+locale);
  const finish=await json(`artifacts/postclear-connected/${locale}-completion.json`);requireValue(finish.release===release&&finish.sdk?.sha256===sdk.sha256&&finish.completed===true&&finish.departed===true&&finish.sourceAwardChapter===9&&finish.chapters?.includes('ninth')&&finish.cuts?.includes('title-runtime')&&finish.oldReadKept>39000&&finish.newRead>=finish.oldReadKept,'POSTCLEAR_STAGE_COMPLETION '+locale);
 }
}
for(const file of ['artifacts/postclear-connected/browser.json','artifacts/cleared-connected/browser.json']){
 const browser=await json(file);requireValue(browser.stats?.expected===2&&browser.stats?.unexpected===0&&browser.stats?.skipped===0,'POSTCLEAR_STAGE_BROWSER '+file);const seen=new Set<string>();
 function visit(suites:typeof browser.suites){for(const suite of suites??[]){for(const spec of suite.specs??[])for(const test of spec.tests??[]){const locale=/^(zh|en):/u.exec(spec.title)?.[1],annotations=[...(test.annotations??[]),...(test.results??[]).flatMap((r:{annotations?:{type:string;description:string}[]})=>r.annotations??[])];requireValue(locale&&test.status==='expected'&&annotations.some((a:{type:string;description:string})=>a.type==='release'&&a.description===releases.get(locale))&&annotations.some((a:{type:string;description:string})=>a.type==='sdk'&&a.description===sdk.sha256),'POSTCLEAR_STAGE_BROWSER_IDENTITY');seen.add(locale);}visit(suite.suites);}}
 visit(browser.suites);requireValue(seen.size===2,'POSTCLEAR_STAGE_BROWSER_LOCALES');
}
const assets=await publicationAssets(source);await mkdir(stage,{recursive:true});for(const entry of await readdir(stage))requireValue(['programs','text','compat','assets'].includes(entry),'POSTCLEAR_STAGE_UNEXPECTED '+entry);
for(const dir of ['programs','text','compat'])await cp(source+'/'+dir,stage+'/'+dir,{recursive:true});for(const a of assets){await mkdir(path.dirname(stage+'/'+a.key),{recursive:true});await copyFile(source+'/'+a.key,stage+'/'+a.key);requireValue(hash(await read(stage+'/'+a.key))===a.sha256,'POSTCLEAR_STAGE_SHA');}
const result={languages:8,releases:Object.fromEntries(releases),sdk,objects:assets.length,bytes:assets.reduce((n,a)=>n+a.bytes,0),testCutsIncluded:0,root:stage,promoted:false,scope:'cleared story and menu incremental release; sequential all-ending play and remaining replica gaps remain separate'};
if(promote){
 const mutable=new Set(['text/locales.pb',...languages.flatMap(locale=>[`programs/${locale}.modules.pb`,`programs/${locale}.title.pb`,`text/${locale}.ui.pb`])]);
 async function append(dir:string){for(const entry of await readdir(stage+'/'+dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory()){await append(file);continue;}if(mutable.has(file))continue;await mkdir(path.dirname(destination+'/'+file),{recursive:true});try{await copyFile(stage+'/'+file,destination+'/'+file,constants.COPYFILE_EXCL);}catch(error){if(!error||typeof error!=='object'||!('code'in error)||error.code!=='EEXIST')throw error;requireValue(hash(await read(stage+'/'+file))===hash(await read(destination+'/'+file)),'POSTCLEAR_PROMOTE_IMMUTABLE '+file);}}}
 for(const dir of ['assets','programs','text','compat'])await append(dir);for(const file of [...mutable].sort((a,b)=>Number(a.endsWith('.modules.pb'))-Number(b.endsWith('.modules.pb')))){await mkdir(path.dirname(destination+'/'+file),{recursive:true});await writeFile(destination+'/'+file+'.next',await read(stage+'/'+file));await rename(destination+'/'+file+'.next',destination+'/'+file);}result.promoted=true;
}
await writeFile(`artifacts/postclear-connected/${promote?'promoted':'staged'}.json`,JSON.stringify(result,null,2));console.log(result);
