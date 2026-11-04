import {readFile,writeFile,mkdir,readdir,copyFile,rename} from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import {decodeWire} from 'galbox-sdk/wire';
import {publicationAssets} from './publication-assets.js';
import {languages,hash} from './locale.js';
import {requireValue} from './kag.js';
const from='generated/sixth-public',to='generated/integrated',mutable=new Set<string>();
for(const locale of languages){const manifest=decodeWire('ModuleManifest',new Uint8Array(await readFile(`${from}/programs/${locale}.modules.pb`))),result=JSON.parse(await readFile(`artifacts/sixth-connected/${locale}-verified.json`,'utf8'));requireValue(result.release===manifest.header.release&&result.oldEndpointContinues&&result.replay,'SIXTH_PROMOTE_CORE');for(const file of [`programs/${locale}.modules.pb`,`programs/${locale}.title.pb`,`text/${locale}.ui.pb`])mutable.add(file);}mutable.add('text/locales.pb');
const browser=JSON.parse(await readFile('artifacts/sixth-connected/local-browser.json','utf8'));requireValue(browser.stats?.expected===17&&browser.stats?.unexpected===0&&browser.stats?.skipped===0,'SIXTH_PROMOTE_BROWSER');const assets=await publicationAssets(from);let added=0,kept=0;
async function copy(dir:string){for(const entry of await readdir(from+'/'+dir,{withFileTypes:true})){const file=dir+'/'+entry.name;if(entry.isDirectory()){await copy(file);continue;}if(mutable.has(file))continue;await mkdir(path.dirname(to+'/'+file),{recursive:true});try{await copyFile(from+'/'+file,to+'/'+file,constants.COPYFILE_EXCL);added++;}catch(e){if(!e||typeof e!=='object'||!('code'in e)||e.code!=='EEXIST')throw e;requireValue(hash(await readFile(from+'/'+file))===hash(await readFile(to+'/'+file)),'SIXTH_PROMOTE_IMMUTABLE '+file);kept++;}}}
for(const dir of ['assets','programs','text','compat'])await copy(dir);for(const file of [...mutable].sort((a,b)=>Number(a.endsWith('.modules.pb'))-Number(b.endsWith('.modules.pb')))){await mkdir(path.dirname(to+'/'+file),{recursive:true});await writeFile(to+'/'+file+'.next',await readFile(from+'/'+file));await rename(to+'/'+file+'.next',to+'/'+file);}await writeFile('artifacts/sixth-connected/promoted.json',JSON.stringify({languages:8,added,kept,oldFilesDeleted:0,objects:assets.length},null,2));console.log({languages:8,added,kept,oldFilesDeleted:0});
