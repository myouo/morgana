import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readOpeningPresentation,readTitleExit} from '../tooling/presentation.js';
import {languages} from '../tooling/locale.js';
test('all eight source openings preserve 44 transitions, original music and page-space layer offsets',async()=>{
 for(const locale of languages){const source=await readFile(`private/text/${locale}/scenario/scenario.ks`,'utf8'),p=readOpeningPresentation(source,30),trans=p.effects.filter(e=>e.kind==='transition');assert.equal(trans.length,44);assert.throws(()=>readOpeningPresentation(source.replace('storage="produce"','storage=&produce'),30),/PRESENTATION_DYNAMIC_ATTRIBUTE/);assert.equal(trans.reduce((n,e)=>n+e.duration,0),locale==='it'?178999:179000);const music=p.effects.filter(e=>e.kind==='music');assert.equal(music.length,1);assert.equal(music[0]?.storage,'ファタモルガーナの館歌入り');assert.equal(music[0]?.loop,true);const overlay=trans.find(e=>e.to.one.storage==='op_1'&&e.to.one.visible);assert.equal(overlay?.to.one.top,30);assert.equal(p.finalPage.message.storage,'meserei0');assert.equal(p.finalPage.message.visible,true);assert.equal(p.setup.some(t=>t.name==='glyph'),/^\[glyph\b/m.test(source.slice(source.indexOf('*opening'),source.indexOf('[qmenu enabled=') )));assert.throws(()=>readOpeningPresentation(source.replace('[trans method="crossfade" time=4000]','[trans method="scroll" time=4000]'),30),/PRESENTATION_TRANSITION/);assert.throws(()=>readOpeningPresentation(source.replace('[wait time="3000"]','[foreign]'),30),/PRESENTATION_UNSUPPORTED/);}
});
test('title exits retain the original rule, two stage durations and asynchronous BGM fade',async()=>{
 for(const locale of languages){const p=readTitleExit(await readFile(`private/text/${locale}/scenario/title.ks`,'utf8'));assert.equal(p.rule,'左上から右下へ');assert.equal(p.ruleMs,4000);assert.equal(p.fadeMs,3000);assert.equal(p.musicFadeMs,5000);}
});
