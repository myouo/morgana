import {readFile,writeFile} from 'node:fs/promises';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import type {ImageFilterAlias} from './check-raster-upgrade.js';
import {hash} from './locale.js';
import {requireValue} from './kag.js';
/** Attach only to checked historical editions which actually contained cleared third code. */
export async function linkRealtimeThirdSources(root:string,locale:string,aliases:readonly ImageFilterAlias[]){
 const file=`${root}/programs/${locale}.title.pb`,meta=decodeWire('JsonValue',new Uint8Array(await readFile(file)));requireValue(meta&&typeof meta==='object'&&!Array.isArray(meta)&&Array.isArray(meta.moduleSources),'REALTIME_SOURCE_METADATA');const linked=[];
 for(const row of meta.moduleSources){requireValue(row&&typeof row==='object'&&!Array.isArray(row)&&typeof row.path==='string'&&typeof row.sha256==='string','REALTIME_SOURCE_ROW');const bytes=new Uint8Array(await readFile(root+'/'+row.path));requireValue(hash(bytes)===row.sha256,'REALTIME_SOURCE_DIGEST');const source=decodeWire('ModuleManifest',bytes);if(!source.functionOrder.some(id=>id.startsWith('postclear-third/')))continue;
  const existing=row.imageAliases??[];requireValue(Array.isArray(existing),'REALTIME_SOURCE_ALIASES');const merged=new Map<string,{from:string;at:string}>();for(const a of existing){requireValue(a&&typeof a==='object'&&!Array.isArray(a)&&typeof a.from==='string'&&typeof a.at==='string','REALTIME_SOURCE_ALIAS');merged.set(a.from,{from:a.from,at:a.at});}for(const a of aliases){const old=merged.get(a.from);requireValue(!old||old.at===a.at,'REALTIME_SOURCE_ALIAS_CONFLICT');merged.set(a.from,a);}row.imageAliases=[...merged.values()];linked.push(source.header.release);
 }
 requireValue(linked.length>=2,'REALTIME_SOURCE_CHAIN');await writeFile(file,encodeWire('JsonValue',meta));return linked;
}
