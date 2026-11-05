import {readFile,writeFile,rename} from 'node:fs/promises';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
import {saveEmptyCaption} from './save-artwork.js';

// Presentation only: preserve every other field and every story/save identity.
const root=process.argv[2]??'generated/integrated',prepared=[];
for(const locale of languages){const file=`${root}/programs/${locale}.title.pb`,meta=decodeWire('JsonValue',new Uint8Array(await readFile(file)));requireValue(meta&&typeof meta==='object'&&!Array.isArray(meta)&&meta.menus&&typeof meta.menus==='object'&&!Array.isArray(meta.menus)&&meta.menus.saveLayout&&typeof meta.menus.saveLayout==='object'&&!Array.isArray(meta.menus.saveLayout),'SAVE_CAPTION_METADATA');meta.menus.saveLayout.emptyCaption=saveEmptyCaption(await readFile(`private/text/${locale}/scenario/saveload.ks`,'utf8'));prepared.push({file,bytes:encodeWire('JsonValue',meta)});}
for(const p of prepared){await writeFile(p.file+'.next',p.bytes);await rename(p.file+'.next',p.file);}console.log('Eight native empty-bookmark captions refreshed; other metadata and programs preserved.');
