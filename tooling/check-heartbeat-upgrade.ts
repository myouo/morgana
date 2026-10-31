import {readFile,copyFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {decodeWire} from 'galbox-sdk/wire';
import {createModuleProgram} from 'galbox-sdk/port-kit';
import type {Function as Fn} from 'galbox-sdk/protocol';
import {isFilteredSubstitution,unchangedOrFiltered} from './check-raster-upgrade.js';
import type {ImageFilterAlias} from './check-raster-upgrade.js';
import {hash} from './locale.js';
import type {Language} from './locale.js';
import {requireValue} from './kag.js';

export async function checkHeartbeatUpgrade(locale:Language,functions:readonly Fn[],root:string){
 const rows:unknown=JSON.parse(await readFile('private/compat-modules/doors123-before-heartbeat.json','utf8'));
 requireValue(Array.isArray(rows),'HEARTBEAT_SOURCES');
 const row=rows.find(r=>r.locale===locale);
 requireValue(row&&typeof row.path==='string'&&typeof row.sha256==='string','HEARTBEAT_SOURCE');
 const bytes=new Uint8Array(await readFile(row.path));
 requireValue(hash(bytes)===row.sha256,'HEARTBEAT_SOURCE_DIGEST');
 const source=createModuleProgram(decodeWire('ModuleManifest',bytes)),current=new Map(functions.map(f=>[f.id,f])),writers=new Set<string>(),aliases=new Map<string,ImageFilterAlias>();
 for(const module of source.describe().modules){
  const data=new Uint8Array(await readFile('private/compat-modules/files/'+module.uri));
  requireValue(hash(data)===module.sha256&&data.length===module.bytes,'HEARTBEAT_CODE_DIGEST');
  for(const f of decodeWire('ProgramModule',data).functions){
   const now=current.get(f.id);requireValue(now&&unchangedOrFiltered(f,now),'HEARTBEAT_FUNCTION_CHANGED '+f.id);
   for(let n=0;n<f.code.length;n++){const a=f.code[n]!,b=now.code[n]!;if(isFilteredSubstitution(a,b)&&a.op==='stage.image'){const previous=aliases.get(a.asset);if(previous){const first=functions.flatMap(f=>f.code).find(i=>i.at===previous.at);requireValue(first?.op==='stage.image.filtered'&&first.asset===b.asset&&JSON.stringify(first.effect)===JSON.stringify(b.effect),'HEARTBEAT_ALIAS_CONFLICT');}aliases.set(a.asset,{from:a.asset,at:b.at});writers.add(now.id);}}
  }
  await mkdir(path.dirname(root+'/'+module.uri),{recursive:true});await copyFile('private/compat-modules/files/'+module.uri,root+'/'+module.uri);
 }
 requireValue(writers.size>0&&aliases.size>0,'HEARTBEAT_UPGRADE_EMPTY');
 const load=async(id:string):Promise<void>=>{if(source.has(id))return;for(const dep of source.descriptor(id).dependencies??[])await load(dep);source.install(decodeWire('ProgramModule',new Uint8Array(await readFile('private/compat-modules/files/'+source.descriptor(id).uri))));};await load(source.entryModule);
 for(const asset of source.catalog().filter(a=>a.kind==='font')){await mkdir(path.dirname(root+'/'+asset.path),{recursive:true});const data=await readFile('generated/integrated/'+asset.path);requireValue(hash(data)===asset.sha256,'HEARTBEAT_FONT_DIGEST');await copyFile('generated/integrated/'+asset.path,root+'/'+asset.path);}
 const file='compat/modules/'+row.sha256+'.pb';await mkdir(root+'/compat/modules',{recursive:true});await copyFile(row.path,root+'/'+file);
 return {source,row:{release:source.release,sha256:row.sha256,path:file,requiredFunctions:['main',...writers],imageAliases:[...aliases.values()],migration:'frames' as const}};
}
