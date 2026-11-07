import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {decodeWire} from 'galbox-sdk/wire';
import {loadTitleData,titleData} from "../../src/artwork.js";
import {languages} from "../../tooling/locale.js";
test('all forty ordinary/cleared choice layouts load with bounded presentation fragments in eight locales',async()=>{
 const root='generated/postclear-connected';for(const locale of languages){const raw=decodeWire('JsonValue',new Uint8Array(await readFile(`${root}/programs/${locale}.title.pb`)));assert.ok(raw&&typeof raw==='object'&&!Array.isArray(raw));const data=await loadTitleData(raw,async path=>new Uint8Array(await readFile(root+path)));assert.equal(data.choices.length,40);assert.equal(new Set(data.choices.map(c=>c.at)).size,40);assert.ok(data.choices.some(c=>c.at==='postclear-second/postclear-second:choice'));const first=raw.choices;assert.ok(Array.isArray(first)&&first.length>0);assert.equal(titleData({...raw,choices:[...first,...Array.from({length:64-first.length},()=>first[0])]}).choices.length,64);assert.throws(()=>titleData({...raw,choices:[...first,...Array.from({length:65-first.length},()=>first[0])]}),/CHOICE_METADATA/);}
});
