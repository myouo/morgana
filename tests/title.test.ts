import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readTitlePresentation} from '../tooling/title.js';
import {languages} from '../tooling/locale.js';
test('unhandled title instructions cannot disappear in lowering',()=>{assert.throws(()=>readTitlePresentation('*title_main\n[unknown]\n[s]'),/TITLE_UNSUPPORTED_TAG/);assert.throws(()=>readTitlePresentation('*title_main\n[iscript]\nf.x=1;\n[endscript]\n[s]'),/TITLE_DYNAMIC_CONTENT/);});
test('eight fresh titles retain source timing, rule, vague and ordered music',async()=>{for(const locale of languages){const text=await readFile(`private/text/${locale}/scenario/title.ks`,'utf8'),p=readTitlePresentation(text);assert.equal(p.fadeMs,3000);assert.throws(()=>readTitlePresentation(text.replace('storage="女中のテーマピアノソロ"','storage=&女中のテーマピアノソロ')),/TITLE_DYNAMIC_ATTRIBUTE/);assert.equal(p.ruleMs,2500);assert.equal(p.vague,64);assert.equal(p.rule,'右から掠れ');assert.equal(p.music,'女中のテーマピアノソロ');assert.throws(()=>readTitlePresentation(text.replace('rule="右から掠れ"','rule="右から掠れ" children=true')),/UNSUPPORTED_ARGUMENT/);assert.throws(()=>readTitlePresentation(text.replace('time="2500"','time="invalid"')),/TITLE_DURATION/);}});
