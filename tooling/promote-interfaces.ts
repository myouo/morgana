import {readFile,writeFile,mkdir,readdir,copyFile,rename} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import {decodeWire} from 'galbox-sdk/wire';
import {hash,languages} from './locale.js';
import {requireValue} from './kag.js';
import {publicationAssets} from './publication-assets.js';

const from='generated/interfaces-shared',to='generated/integrated',mutable=new Set<string>(),browser=JSON.parse(await readFile('artifacts/interactions/shared-final.json','utf8'));
requireValue([13,15].includes(browser.stats?.expected)&&browser.stats?.unexpected===0&&browser.stats?.skipped===0,'INTERFACE_BROWSER_UNVERIFIED');
for(const locale of languages){const manifest=decodeWire('ModuleManifest',new Uint8Array(await readFile(`${from}/programs/${locale}.modules.pb`))),v=JSON.parse(await readFile(`artifacts/interactions/${locale}-verified.json`,'utf8'));requireValue(v.release===manifest.header.release&&v.menuRoundTrip&&v.searchReplay&&v.endings&&v.oldPresentationMigrated&&v.opSavingForbidden,'INTERFACE_CORE_UNVERIFIED '+locale);for(const f of [`programs/${locale}.modules.pb`,`programs/${locale}.title.pb`,`text/${locale}.ui.pb`])mutable.add(f);}mutable.add('text/locales.pb');
if(browser.stats.expected===13){for(const kind of ['shared-fault','shared-native-states']){const r=JSON.parse(await readFile('artifacts/interactions/'+kind+'.json','utf8'));requireValue(r.stats?.expected===1&&r.stats?.unexpected===0,'INTERFACE_SPECIAL_UNVERIFIED '+kind);}}const assets=await publicationAssets(from);let added=0,kept=0;
async function copyTree(dir:string){for(const entry of await readdir(from+'/'+dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory()){await copyTree(file);continue;}if(mutable.has(file))continue;await mkdir(path.dirname(to+'/'+file),{recursive:true});try{await copyFile(from+'/'+file,to+'/'+file,constants.COPYFILE_EXCL);added++;}catch(e){if(!e||typeof e!=='object'||!('code'in e)||e.code!=='EEXIST')throw e;requireValue(hash(await readFile(from+'/'+file))===hash(await readFile(to+'/'+file)),'INTERFACE_IMMUTABLE '+file);kept++;}}}
for(const dir of ['assets','compat','programs','text'])await copyTree(dir);
for(const file of [...mutable].sort((a,b)=>Number(a.endsWith('.modules.pb'))-Number(b.endsWith('.modules.pb')))){await mkdir(path.dirname(to+'/'+file),{recursive:true});await writeFile(to+'/'+file+'.next',await readFile(from+'/'+file));await rename(to+'/'+file+'.next',to+'/'+file);}
await writeFile('artifacts/interactions/promoted.json',JSON.stringify({languages:8,added,kept,objects:assets.length,bytes:assets.reduce((n,a)=>n+a.bytes,0),oldFilesDeleted:0},null,2));console.log({languages:8,added,kept,objects:assets.length,bytes:assets.reduce((n,a)=>n+a.bytes,0),oldFilesDeleted:0});
