import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readAwakening} from '../tooling/awakening.js';
import {languages} from '../tooling/locale.js';
import {encodePOText,decodePOText,poControls} from '../tooling/po-text.js';
import {localeInfo} from '../src/locales.js';
import {localizeOpening} from '../tooling/localize-opening.js';
const load=async(l:string)=>({source:await readFile(`private/text/${l}/scenario/scenario.ks`,'utf8'),macro:await readFile(`private/text/${l}/scenario/macro.ks`,'utf8')});
test('eight source awakenings preserve IDs, fresh-profile branches, per-language wait units and protected styles',async()=>{
 const en=await load('en'),english=readAwakening(en.source,en.macro),ids=english.pages.map(p=>p.id);for(const locale of languages){const raw=await load(locale),chapter=readAwakening(raw.source,raw.macro);assert.deepEqual(chapter.pages.map(p=>p.id),ids);assert.equal(chapter.pages.length,10);assert.equal(chapter.duration,4000);assert.equal(chapter.pages.filter(p=>p.mode==='whisper').length,5);const waits=chapter.pages.flatMap(p=>p.runs.filter(r=>r.kind==='pause.units'));assert.ok(waits.length>0);assert.ok(waits.every(r=>r.kind==='pause.units'&&r.units===(['jp','ko','zh'].includes(locale)?8:12)));for(const p of chapter.pages){const decoded=decodePOText(encodePOText(p.runs),p.runs);assert.equal(decoded.plain,p.text);assert.deepEqual(poControls(decoded.runs),poControls(p.runs));}const localized=await localizeOpening({...chapter,source:'scenario',musicFadeMs:4000},{...english,source:'scenario',musicFadeMs:4000},localeInfo[locale].html,undefined,'awakening.po');assert.equal(localized.edited.size,0);}
});
test('unknown conditions, commands and changed wait macro are rejected instead of disappearing',async()=>{
 const {source,macro}=await load('en');assert.throws(()=>readAwakening(source.replace('Your[else]','Your[unknowncommand][else]'),macro),/AWAKENING_UNSUPPORTED/);const index=source.indexOf('*zero2|'),changed=source.slice(0,index)+source.slice(index).replace('sf.fataend!=1','f.unverified==1');assert.throws(()=>readAwakening(changed,macro),/AWAKENING_CONDITION/);assert.throws(()=>readAwakening(source,macro.replace('wc time=12','wc time=&unknown')),/AWAKENING_W_MACRO/);
});
