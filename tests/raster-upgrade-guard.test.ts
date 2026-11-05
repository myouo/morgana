import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {decodeWire} from 'galbox-sdk/wire';
import {checkRasterFunctions} from '../tooling/check-raster-upgrade.js';
test('real cleared-third raster upgrade keeps story/anchors/durations strict',async()=>{
 async function load(root:string){const m=decodeWire('ModuleManifest',new Uint8Array(await readFile(root+'/programs/zh.modules.pb')));return(await Promise.all(m.modules.map(async d=>decodeWire('ProgramModule',new Uint8Array(await readFile(root+'/'+d.uri)))))).flatMap(m=>m.functions);}
 const old=await load('generated/postclear-third'),current=await load('generated/postclear-third-realtime');assert.ok(checkRasterFunctions(old,current).requiredFunctions.length>1);
 const story=structuredClone(current),text=story.flatMap(f=>f.code).find(i=>i.op==='text.rich');assert.ok(text?.op==='text.rich');text.textId+='-changed';assert.throws(()=>checkRasterFunctions(old,story),/RASTER_UPGRADE_UNEXPECTED/);
 const anchors=structuredClone(current);anchors[0]!.code[0]!.at+='-changed';assert.throws(()=>checkRasterFunctions(old,anchors),/RASTER_UPGRADE_ADDRESS/);
 const clock=structuredClone(current),film=clock.flatMap(f=>f.code).find(i=>i.op==='stage.raster'&&i.effect.kind==='film');assert.ok(film?.op==='stage.raster'&&film.effect.kind==='film');film.effect.periodSteps++;assert.throws(()=>checkRasterFunctions(old,clock),/RASTER_UPGRADE_DURATION/);
});
