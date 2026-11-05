import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {readDoorIR} from '../tooling/door-ir.js';
import {readDoorText} from '../tooling/door-text.js';
import {chapterProfile} from '../tooling/chapter-profile.js';
import {chapters} from '../tooling/chapter-catalog.js';
import {localeInfo} from '../src/locales.js';
import {sourceHistoryProfile} from '../tooling/source-history-profile.js';
test('real fourth-door annotation IR preserves visible text identities and source output guards',async()=>{
 const rows=[];for(const locale of ['zh','en']as const){const source=await readFile(`private/text/${locale}/scenario/scenario4.ks`,'utf8'),macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8'),profile=await sourceHistoryProfile(locale),ir=chapterProfile(await readDoorIR(source,localeInfo[locale].html,{chapter:chapters.find(c=>c.id==='door4')!,catalogRoot:'locales'}),false,'select_maid'),options={namespace:'door4',extended:true,historyPolicy:true},before=readDoorText(ir,macro,locale==='zh'?22:18,options),after=readDoorText(ir,macro,locale==='zh'?22:18,{...options,historyAnnotations:profile}),texts=(story:typeof before)=>story.nodes.flatMap(n=>n.kind==='text'?[{at:n.at,content:n.atoms.map(a=>a.kind==='text'?a.text:a.kind==='break'?'\n':'').join(''),appendFrom:n.appendFrom,completion:n.completion}]:[]);assert.deepEqual(texts(after),texts(before));const annotations=after.nodes.flatMap(n=>n.kind==='tag'&&n.historyAnnotation?[n.historyAnnotation]:[]);assert.equal(annotations.length,locale==='zh'?331:372);assert.ok(annotations.every(n=>typeof n.enabled==='boolean'&&n.text.length>0));rows.push({locale,annotations:annotations.length,enabled:annotations.filter(n=>n.enabled).length,disabled:annotations.filter(n=>!n.enabled).length,speakerSuppressed:annotations.filter(n=>n.speakerSuppressed).length,visibleTextParts:texts(after).length});}
 await mkdir('artifacts/history-annotations',{recursive:true});await writeFile('artifacts/history-annotations/ir.json',JSON.stringify({rows,scope:'source IR of normal fourth-door opening through select_maid; not full narrative execution or original UI certification'},null,2));
});
