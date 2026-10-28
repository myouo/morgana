import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {stringify} from 'smol-toml';
import {chapters} from './chapter-catalog.js';
import {extractChapter} from './ks-po.js';
import {languages,hash} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {requireValue} from './kag.js';
const name=process.argv[2]??'door1',spec=chapters.find(c=>c.id===name);requireValue(spec,'CHAPTER_UNKNOWN');
const profiles:Record<string,{folders:string[];extensions:string[]}>=Object.fromEntries([
 ...['image:storage','position:frame','button:graphic'].map(key=>[key,{folders:['bgimage','fgimage','image'],extensions:['png','jpg']}]),
 ['trans:rule',{folders:['rule'],extensions:['png','jpg']}],
 ...['playse:storage','fadeinse:storage','playbgm:storage','fadeinbgm:storage','button:enterse','button:clickse'].map(key=>[key,{folders:['sound','bgm'],extensions:['ogg','wav','mp3']}]),
]);
const files=new Map<string,{file:string;sha256:string;bytes:number;locales:Set<string>;references:number}>(),unresolved:{locale:string;line:number;kind:string;name:string;reason:string}[]=[];
for(const locale of languages){const extraction=extractChapter(await readFile(`private/text/${locale}/scenario/${spec.file}`,'utf8'),spec);
 for(const ref of extraction.resources){const profile=profiles[ref.kind];if(!profile){unresolved.push({locale,line:ref.line,kind:ref.kind,name:ref.name,reason:'macro/component resource, needs semantic expansion'});continue;}
  if(path.basename(ref.name)!==ref.name||['.','..'].includes(ref.name)){unresolved.push({locale,line:ref.line,kind:ref.kind,name:ref.name,reason:'non-flat storage reference'});continue;}
  let found:string|undefined;for(const group of [locale,'shared']){for(const folder of profile.folders){for(const ext of profile.extensions){const file=`private/extracted/${group}/${folder}/${ref.name}.${ext}`;if(existsSync(file)){found=file;break;}}if(found)break;}if(found)break;}
  if(!found){unresolved.push({locale,line:ref.line,kind:ref.kind,name:ref.name,reason:'literal resource not found in extracted locale/shared search order'});continue;}
  if(existsSync(found.replace(/\.[^.]+$/u,'.asd'))){unresolved.push({locale,line:ref.line,kind:ref.kind,name:ref.name,reason:'animated resource requires animation expansion'});continue;}
  const bytes=await readFile(found),sha=hash(bytes),key=sha+path.extname(found);let record=files.get(key);if(!record){record={file:found,sha256:sha,bytes:(await stat(found)).size,locales:new Set(),references:0};files.set(key,record);}record.locales.add(localeInfo[locale].html);record.references++;
 }
}
await mkdir('private/generated/chapters',{recursive:true});const resolved=[...files.values()].map(f=>({...f,locales:[...f.locales].sort()}));await writeFile(`private/generated/chapters/${name}-assets.toml`,stringify({chapter:name,complete:false,resolved,unresolved}));
const unresolvedGroups=new Map<string,number>();for(const ref of unresolved)unresolvedGroups.set(ref.kind,(unresolvedGroups.get(ref.kind)??0)+1);
await mkdir('artifacts/chapters',{recursive:true});await writeFile(`artifacts/chapters/${name}-assets-summary.toml`,stringify({chapter:name,complete:false,unique_files:files.size,bytes:resolved.reduce((n,f)=>n+f.bytes,0),unresolved:unresolved.length,unresolved_kinds:Object.fromEntries(unresolvedGroups)}));
console.log(`${name}: ${files.size} distinct literal resources / ${resolved.reduce((n,f)=>n+f.bytes,0)} bytes; ${unresolved.length} unresolved macro/animation references. No incomplete dependency set is published.`);
