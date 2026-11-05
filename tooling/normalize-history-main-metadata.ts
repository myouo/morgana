import {readFile,writeFile} from 'node:fs/promises';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {requireValue} from './kag.js';
/** History-only insertions create no new save point or choice appearance. */
export async function normalizeHistoryMainMetadata(root:string,locale:string){const file=`${root}/programs/${locale}.title.pb`,meta=decodeWire('JsonValue',new Uint8Array(await readFile(file))),base=decodeWire('JsonValue',new Uint8Array(await readFile(`generated/integrated/programs/${locale}.title.pb`)));requireValue(meta&&typeof meta==='object'&&!Array.isArray(meta)&&base&&typeof base==='object'&&!Array.isArray(base),'HISTORY_MAIN_METADATA');for(const key of ['autoAt','textAutoAt','uiAutoAt','choices']){if(base[key]!==undefined)meta[key]=base[key];else delete meta[key];}await writeFile(file,encodeWire('JsonValue',meta));}
if(process.argv[1]?.endsWith('/normalize-history-main-metadata.ts'))await normalizeHistoryMainMetadata(process.argv[2]??'generated/history-main',process.argv[3]??'zh');
