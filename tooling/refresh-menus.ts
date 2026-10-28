import {readFile,writeFile} from 'node:fs/promises';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {parseJsonValue} from 'galbox-sdk/protocol';
import {menuArtwork} from './menu-artwork.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
/** Interface-only resource changes do not rewrite the story or its save identity. */
const prepared=[];
for(const locale of languages){const file=`public/programs/${locale}.title.pb`,current=decodeWire('JsonValue',new Uint8Array(await readFile(file)));requireValue(current&&typeof current==='object'&&!Array.isArray(current),'TITLE_METADATA');prepared.push({file,bytes:encodeWire('JsonValue',parseJsonValue({...current,menus:await menuArtwork(locale)}))});}
for(const entry of prepared)await writeFile(entry.file,entry.bytes);
console.log('Eight menu catalogs refreshed; story programs remain byte-identical');
