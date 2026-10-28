import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {Content} from '../tooling/content.js';
test('concurrent buttons referencing one sound register exactly one audio identity',async()=>{
 const b=new ProgramBuilder({gameId:'content-dedupe',release:'v1',entry:'main'}),content=new Content(b,'en'),refs=await Promise.all(Array.from({length:8},()=>content.audio('button','buffer')));assert.ok(refs.every(r=>r===refs[0]));const p=b.function({id:'main',entry:'end',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.end',{at:'end'})]}).build();assert.equal(p.assets.length,1);assert.equal(p.assets[0]?.playback,'buffer');
});
