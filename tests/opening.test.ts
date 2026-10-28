import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readOpening} from '../tooling/opening.js';
const source='*prologstart\n[qmenu enabled=true]\n[jinobun]\n[c text="Original line"][p]\n*stable|\n[cm]\n[fadeoutbgm time=1]';
test('page identity comes from source continuation labels and keeps original line positions',()=>{const opening=readOpening(source,'authored.ks');assert.equal(opening.pages[0]?.id,'stable');assert.equal(opening.pages[0]?.text,'Original line');assert.equal(opening.pages[0]?.source.line,4);assert.equal(opening.pages[0]?.labelLine,5);});
test('click waits are actual controls, while unknown commands and malformed source are rejected',()=>{const p=readOpening(source.replace('[p]','[l][p]'),'input');assert.equal(p.pages[0]?.runs.at(-1)?.kind,'confirm');assert.throws(()=>readOpening(source.replace('[p]','[waitclick][p]'),'input'),/UNSUPPORTED_TAG/);assert.throws(()=>readOpening(source.replace('[jinobun]','[iscript]\nthrow 1;\n[endscript]'),'input'),/UNSUPPORTED_TAG|UNSUPPORTED_SCRIPT/);assert.throws(()=>readOpening(source.replace('*stable|',''),'input'),/PAGE_ID/);});
