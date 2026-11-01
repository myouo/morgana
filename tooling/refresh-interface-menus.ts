import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import {parseJsonValue} from 'galbox-sdk/protocol';
import type {JsonValue} from 'galbox-sdk/protocol';
import {menuArtwork} from './menu-artwork.js';
import {saveBookmarkParts} from './save-bookmarks.js';
import {readUI} from './po.js';
import {hash,languages} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {requireValue} from './kag.js';

/** Presentation-only refresh. Program, manifest and save identities stay intact. */
const root=process.argv[2]??'generated/interactions',prepared=[];
for(const locale of languages){const file=`${root}/programs/${locale}.title.pb`,meta=decodeWire('JsonValue',new Uint8Array(await readFile(file)));requireValue(meta&&typeof meta==='object'&&!Array.isArray(meta),'INTERFACE_META');const map=async(v:JsonValue):Promise<JsonValue>=>{if(typeof v==='string'&&v.startsWith('assets/')){const bytes=await readFile('public/'+v),target=`assets/locales/${localeInfo[locale].html}/images/${hash(bytes)}${path.extname(v)}`;await mkdir(path.dirname(root+'/'+target),{recursive:true});await writeFile(root+'/'+target,bytes);return target;}if(Array.isArray(v))return Promise.all(v.map(map));if(v&&typeof v==='object')return Object.fromEntries(await Promise.all(Object.entries(v).map(async([k,x])=>[k,await map(x)])));return v;};meta.menus=await map(parseJsonValue(await menuArtwork(locale)));meta.saveNameParts=await saveBookmarkParts(locale,root);prepared.push({file,bytes:encodeWire('JsonValue',meta)},{file:`${root}/text/${locale}.ui.pb`,bytes:encodeWire('InterfaceTextCatalog',await readUI(localeInfo[locale].html))});}
for(const entry of prepared){await writeFile(entry.file+'.next',entry.bytes);await rename(entry.file+'.next',entry.file);}console.log('Eight source menu catalogs and bookmark parts refreshed; story manifests unchanged.');
