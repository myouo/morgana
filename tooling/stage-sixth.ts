import {readFile,writeFile,mkdir,cp,copyFile,readdir} from 'node:fs/promises';
import path from 'node:path';
import {decodeWire} from 'galbox-sdk/wire';
import {publicationAssets} from './publication-assets.js';
import {languages,hash} from './locale.js';
import {requireValue} from './kag.js';
const from='generated/sixth-connected',to='generated/sixth-public';
for(const locale of languages){const manifest=decodeWire('ModuleManifest',new Uint8Array(await readFile(`${from}/programs/${locale}.modules.pb`))),result=JSON.parse(await readFile(`artifacts/sixth-connected/${locale}-verified.json`,'utf8'));requireValue(result.release===manifest.header.release&&result.oldEndpointContinues&&result.replay&&result.textParts>=1800,'SIXTH_UNVERIFIED '+locale);}
const browser=JSON.parse(await readFile('artifacts/sixth-connected/local-browser.json','utf8'));requireValue(browser.stats?.expected===17&&browser.stats?.unexpected===0&&browser.stats?.skipped===0,'SIXTH_BROWSER_UNVERIFIED');
const assets=await publicationAssets(from);await mkdir(to,{recursive:true});for(const entry of await readdir(to))requireValue(['programs','text','compat','assets'].includes(entry),'SIXTH_STAGE_UNEXPECTED '+entry);for(const dir of ['programs','text','compat'])await cp(from+'/'+dir,to+'/'+dir,{recursive:true});for(const a of assets){await mkdir(path.dirname(to+'/'+a.key),{recursive:true});await copyFile(from+'/'+a.key,to+'/'+a.key);requireValue(hash(await readFile(to+'/'+a.key))===a.sha256,'SIXTH_STAGE_SHA');}
await mkdir('artifacts/sixth-connected',{recursive:true});await writeFile('artifacts/sixth-connected/staged.json',JSON.stringify({languages:8,objects:assets.length,bytes:assets.reduce((n,a)=>n+a.bytes,0),testCutsIncluded:0,root:to},null,2));console.log({languages:8,objects:assets.length,testCutsIncluded:0});
