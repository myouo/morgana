import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {tokenize} from '../tooling/kag.js';import {historyTrailingBreaks,historySourceKey,sourceHistoryProfile} from '../tooling/source-history-profile.js';
test('adjacent source history fragments keep inline formatting while explicit guarded hr adds only declared line breaks',()=>{
 const tokens=tokenize('[hisout txt="a"][i][hisout txt="b"][/i][hisout txt="c"][hr][hr][history output=false][hr][history output=true][hr][maid][hr]','sample.ks'),breaks=historyTrailingBreaks(tokens),notes=tokens.filter(t=>t.kind==='tag'&&t.name==='hisout');assert.deepEqual(notes.map(t=>t.kind==='tag'?breaks.get(historySourceKey(t)):undefined),[0,0,3]);
 const unknown=tokenize('[hisout txt="a"][if exp="dynamic"][hr][endif]','sample.ks'),first=unknown[0];assert.ok(first?.kind==='tag');assert.equal(historyTrailingBreaks(unknown).get(historySourceKey(first)),0);
});
test('the actual western split-style opening and CJK opening retain their different explicit line boundaries',async()=>{
 for(const locale of ['en','fr','it','jp','ko','pt-br','ru','zh']as const)await sourceHistoryProfile(locale);
 for(const locale of ['en','zh']as const){const tokens=tokenize(await readFile(`private/text/${locale}/scenario/scenario4.ks`,'utf8'),'scenario4.ks'),breaks=historyTrailingBreaks(tokens),notes=tokens.filter(t=>t.kind==='tag'&&t.name==='hisout').slice(0,3);assert.deepEqual(notes.map(t=>t.kind==='tag'?breaks.get(historySourceKey(t)):undefined),locale==='en'?[0,0,1]:[1,1,1]);}
});
