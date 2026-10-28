import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {sourceReplayCatalog,firstDoorCompletion} from '../tooling/chapter-replay.js';
import {languages} from '../tooling/locale.js';
test('all eight source replay pages use the first-door completion gate and reject missing chapter bodies',async()=>{for(const l of languages){const b=new ProgramBuilder({gameId:'source-replay-contract',release:'v1',entry:'main'}),s=await readFile(`private/text/${l}/scenario/chapter.ks`,'utf8');sourceReplayCatalog(b,s,{prologue:'Fixture prologue',door1:'Fixture door'});b.function({id:'main',entry:'end',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.end',{at:'end'})]});assert.throws(()=>b.build(),/EXTRAS_SCENE_ENTRY/);assert.equal(firstDoorCompletion(await readFile(`private/text/${l}/scenario/scenario.ks`,'utf8'),'complete').op,'profile.set');assert.throws(()=>sourceReplayCatalog(new ProgramBuilder({gameId:'wrong',release:'v1',entry:'main'}),s.replaceAll('sf.scenario1==true','sf.other==true'),{prologue:'P',door1:'D'}),/GATE/);}});
