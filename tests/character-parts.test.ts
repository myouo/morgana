import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CharacterParts} from '../tooling/character-parts.js';
import {PortraitAssets} from '../tooling/portrait-assets.js';
import {lowerPortrait} from '../tooling/lower-character.js';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
test('character part source semantics prefer named images, retain =/empty/tails, clear -, and isolate failures',()=>{
 const known=new Map(['Ada_body','Ada_face','face','badge'].map(s=>[s,{width:12,height:18,animated:false}])),model=new CharacterParts(s=>known.get(s)??null),a=model.update('Ada','body face -','0,0 1,2 3,4');assert.equal(a[1]!.storage,'Ada_face');a[0]={storage:'changed',x:99,y:99};assert.equal(model.snapshot('Ada')[0]!.storage,'Ada_body');assert.equal(model.update('Ada','= = badge')[2]!.storage,'badge');assert.equal(model.update('Ada','=')[2]!.storage,'badge');assert.equal(model.update('Ada','= = -')[2]!.storage,'');const before=model.snapshot('Ada');assert.throws(()=>model.update('Ada','= missing'),/MISSING/);assert.deepEqual(model.snapshot('Ada'),before);assert.throws(()=>model.update('Ada','= =','&f.x,0'),/COORDINATE/);assert.deepEqual(model.snapshot('Ada'),before);model.clear('Ada');assert.deepEqual(model.snapshot('Ada'),[]);
});
test('real source portrait composition uses public SDK stage tasks and preserves a mid-crossfade protobuf snapshot',async()=>{
 const images=new PortraitAssets('en'),model=new CharacterParts(images.lookup),plain=model.update('女中','体 普通 - - '),smile=model.update('女中','体 喜び - - '),b=new ProgramBuilder({gameId:'source-portrait-probe',release:'v1',entry:'main'});
 const first=await lowerPortrait(b,images,plain,'portrait:first','maid',{x:308,y:0},1000),next=await lowerPortrait(b,images,smile,'portrait:smile','maid',{x:308,y:0},300,first.asset);const repeated=await lowerPortrait(b,images,smile,'portrait:repeat','maid',{x:308,y:0},0,next.asset);
 b.function({id:'main',entry:'portrait:first',layout:1,params:[],locals:[],returns:'void',code:[...first.code,...next.code,...repeated.code,instruction('control.end',{at:'end'})]});const program=b.build();assert.equal(program.assets.length,2);let core=createCore(program);core.run(100);core.accept({type:'tick',ms:1000});core.run(100);core.accept({type:'tick',ms:100});const snapshot=core.capture();assert.equal(snapshot.stage[0]?.layers?.length,2);assert.ok(Math.abs((snapshot.stage[0]?.layers?.[1]?.weight??0)-1/3)<1e-6);assert.ok(snapshot.tasks.some(t=>t.stageTask?.type==='transition'&&t.elapsed===100));const restored=createCore(program,undefined,decodeWire('Snapshot',encodeWire('Snapshot',snapshot)));assert.deepEqual(restored.capture(),snapshot);restored.accept({type:'tick',ms:200});restored.run(100);assert.equal(restored.capture().status,'ended');assert.equal(restored.capture().stage[0]?.asset,next.asset.id);
});
