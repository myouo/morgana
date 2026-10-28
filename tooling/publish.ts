import {readFile,writeFile,mkdir,rm,rename} from 'node:fs/promises';
import path from 'node:path';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {splitProgramText,bindProgramText} from 'galbox-sdk/port-kit';
import {parseProgram,parseJsonValue} from 'galbox-sdk/protocol';
import type {JsonValue} from 'galbox-sdk/protocol';
import {createReleaseManifest,inspectResource} from 'galbox-sdk/release';
import {languages,hash} from './locale.js';
import type {Language} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {readLanguages,readUI,readStory,readPO} from './po.js';
import {encodePOText} from './po-text.js';
import {requireValue} from './kag.js';
import {publishLegacy} from './publish-legacy.js';
import {readDoorIR} from './door-ir.js';import {readDoorText} from './door-text.js';
function paths(value:JsonValue):string[]{if(typeof value==='string')return value.startsWith('assets/')?[value]:[];if(Array.isArray(value))return value.flatMap(paths);if(value&&typeof value==='object')return Object.values(value).flatMap(paths);return [];}
function mapPaths(value:JsonValue,mapping:Map<string,string>):JsonValue {if(typeof value==='string')return mapping.get(value)??value;if(Array.isArray(value))return value.map(v=>mapPaths(v,mapping));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,mapPaths(v,mapping)]));return value;}
/** Rebuild only the referenced release closure. The converter's scratch public is never deployed. */
export async function publish(){
 const languagesCatalog=await readLanguages();
 const stage='generated/site.next';await rm(stage,{recursive:true,force:true});await mkdir(stage+'/programs',{recursive:true});await mkdir(stage+'/text',{recursive:true});
 const rows=await Promise.all(languages.map(async locale=>({locale,program:decodeWire('Program',new Uint8Array(await readFile(`public/programs/${locale}.pb`))),title:decodeWire('JsonValue',new Uint8Array(await readFile(`public/programs/${locale}.title.pb`)))})));
 const coreUsage=new Map<string,Set<Language>>(),usage=new Map<string,Set<Language>>(),files=new Map<string,{bytes:Uint8Array;sha:string}>();
 for(const row of rows)for(const file of new Set([...row.program.assets.map(a=>a.path),...paths(row.title)])){
  requireValue(/^assets\/[a-zA-Z0-9.-]+$/u.test(file),'PUBLICATION_PATH '+file);let data=files.get(file);if(!data){const bytes=new Uint8Array(await readFile('public/'+file));data={bytes,sha:hash(bytes)};files.set(file,data);}const key=data.sha+path.extname(file),owners=usage.get(key)??new Set<Language>();owners.add(row.locale);usage.set(key,owners);
 }
 // New view-only references must not move existing Core files between locale/shared scopes.
 for(const row of rows){const title=row.title;requireValue(title&&typeof title==='object'&&!Array.isArray(title),'TITLE_METADATA');const {presentationAssets:ignored,...coreTitle}=title;void ignored;for(const file of new Set([...row.program.assets.map(a=>a.path),...paths(coreTitle)])){const data=files.get(file);requireValue(data,'PUBLICATION_FILE');const key=data.sha+path.extname(file),owners=coreUsage.get(key)??new Set<Language>();owners.add(row.locale);coreUsage.set(key,owners);}}
 const inventory=new Map<string,{bytes:number;sha256:string}>();
 for(const row of rows){
  const mapping=new Map<string,string>();for(const old of new Set([...row.program.assets.map(a=>a.path),...paths(row.title)])){const data=files.get(old);requireValue(data,'PUBLICATION_FILE');const ext=path.extname(old),shared=(coreUsage.get(data.sha+ext)??usage.get(data.sha+ext))?.size===languages.length,scope=shared?'shared':`locales/${localeInfo[row.locale].html}`,kind=ext==='.ttf'?'fonts':['.ogg','.wav','.mp3'].includes(ext)?'audio':'images',file=`assets/${scope}/${kind}/${data.sha}${ext}`;mapping.set(old,file);if(!inventory.has(file)){await mkdir(path.dirname(stage+'/'+file),{recursive:true});await writeFile(stage+'/'+file,data.bytes);inventory.set(file,{bytes:data.bytes.byteLength,sha256:data.sha});}}
  const p=parseProgram(row.program);for(const a of p.assets){const file=mapping.get(a.path);requireValue(file,'PUBLICATION_ASSET');a.path=file;requireValue(inventory.get(file)?.sha256===a.sha256,'PUBLICATION_DIGEST '+a.id);}
  const textSource=await readStory(localeInfo[row.locale].html),pages=p.functions.flatMap(f=>f.code.filter(i=>i.op==='text.rich'&&!i.at.startsWith('door1:')));requireValue(pages.length===textSource.size&&pages.every(i=>i.op==='text.rich'&&textSource.get('page:'+i.textId)?.text===encodePOText(i.runs)),'PO_STALE_PROGRAM: run pnpm convert');
  const chapterNodes=p.functions.flatMap(f=>f.code.filter(i=>i.op==='text.rich'&&i.at.startsWith('door1:')));if(chapterNodes.length){const raw=await readFile(`private/text/${row.locale}/scenario/scenario.ks`,'utf8'),macro=await readFile(`private/text/${row.locale}/scenario/macro.ks`,'utf8'),door=readDoorText(await readDoorIR(raw,localeInfo[row.locale].html),macro,['jp','zh','ko'].includes(row.locale)?22:18),expected=new Map(door.nodes.flatMap(n=>n.kind==='text'?[[n.at,n]as const]:[]));requireValue(chapterNodes.length===expected.size&&chapterNodes.every(i=>i.op==='text.rich'&&expected.get(i.at)?.atoms.map(a=>a.kind==='text'?a.text:a.kind==='break'?'\n':'').join('')===i.runs.map(r=>r.kind==='text'&&r.content.op==='literal'?r.content.value:r.kind==='break'?'\n':'').join('')),'PO_STALE_DOOR: run pnpm convert');}
  const choices=await readPO(`locales/${localeInfo[row.locale].html}/choices.po`,localeInfo[row.locale].html),options=p.functions.flatMap(f=>f.code.flatMap(i=>i.op==='choice'&&i.at!=='title:wait'?i.options:[]));requireValue(options.length===choices.size&&options.every(o=>choices.get('choice:'+o.id)?.text===o.text),'PO_STALE_CHOICES');
  p.release=`steam21523397-${row.locale}-${hash(encodeWire('Program',p)).slice(0,16)}`;
  const {template,catalog}=splitProgramText(p,localeInfo[row.locale].html),bound=bindProgramText(template,catalog);requireValue(hash(encodeWire('Program',bound))===hash(encodeWire('Program',p)),'TEXT_REBIND_BYTES');
  const resources=await Promise.all(p.assets.map(async a=>inspectResource(a,new Uint8Array(await readFile(stage+'/'+a.path)),bytes=>new TextDecoder('utf-8',{fatal:true}).decode(bytes))));
  const release=await createReleaseManifest({program:p,series:`opening-v1-${row.locale}`,resources,resourceScope:'resident'},{async sha256(text){return hash(text);}});
  await writeFile(`${stage}/programs/${row.locale}.pb`,encodeWire('Program',template));await writeFile(`${stage}/programs/${row.locale}.release.pb`,encodeWire('ReleaseManifest',release));await writeFile(`${stage}/programs/${row.locale}.title.pb`,encodeWire('JsonValue',await (async()=>{const metadata=mapPaths(row.title,mapping);requireValue(metadata&&typeof metadata==='object'&&!Array.isArray(metadata),'TITLE_METADATA');return parseJsonValue({...metadata,migrations:await publishLegacy(stage,row.locale)});})()));
  await writeFile(`${stage}/text/${row.locale}.story.pb`,encodeWire('ProgramTextCatalog',catalog));await writeFile(`${stage}/text/${row.locale}.ui.pb`,encodeWire('InterfaceTextCatalog',await readUI(catalog.locale)));
 }
 await writeFile(stage+'/text/locales.pb',encodeWire('LocaleCatalog',languagesCatalog));
 await mkdir('artifacts/publication',{recursive:true});await writeFile('artifacts/publication/inventory.yaml',(await import('yaml')).stringify({objects:[...inventory].map(([key,data])=>({key,...data})),count:inventory.size,bytes:[...inventory.values()].reduce((n,x)=>n+x.bytes,0)}));
 // Atomic directory promotion on the same filesystem, preserving the previous version on failure.
 await rm('generated/site.previous',{recursive:true,force:true});try{await rename('generated/site','generated/site.previous');}catch(e){if(!(e instanceof Error)||!('code'in e)||e.code!=='ENOENT')throw e;}
 try{await rename(stage,'generated/site');}catch(e){await rename('generated/site.previous','generated/site').catch(()=>{});throw e;}
 console.log(`Publication: ${inventory.size} referenced assets, ${[...inventory.values()].reduce((n,x)=>n+x.bytes,0)} bytes; eight isolated text catalogs`);
}
if(process.argv[1]?.endsWith('/publish.ts'))await publish();
