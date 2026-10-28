import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {readDoorIR} from '../tooling/door-ir.js';
import {tokenize} from '../tooling/kag.js';
import {chapters} from '../tooling/chapter-catalog.js';
import type {ChapterSpec} from '../tooling/chapter-catalog.js';
import {languages} from '../tooling/locale.js';
import {localeInfo} from '../src/locales.js';

test('eight-locale first interlude and whole second-door IR preserve source control, scripts and chapter tails without executing them',async()=>{
 const specs:readonly ChapterSpec[]=chapters.filter(c=>c.id==='interlude1'||c.id==='door2'),rows=[];
 for(const language of languages)for(const spec of specs){const locale=localeInfo[language].html,source=await readFile(`private/text/${language}/scenario/${spec.file}`,'utf8'),ir=await readDoorIR(source,locale,{chapter:spec,catalogRoot:'artifacts/chapter-catalogs'}),all=tokenize(source,spec.file),begin=all.findIndex(t=>t.kind==='label'&&t.name===spec.start),last=spec.end?all.findIndex((t,i)=>i>begin&&t.kind==='label'&&t.name===spec.end):all.length,native=all.slice(begin,last);
  const controls=(tokens:typeof ir.tokens)=>tokens.flatMap(t=>t.kind==='label'||t.kind==='tag'&&t.name!=='p'||t.kind==='script'?[{kind:t.kind,line:t.source.line,column:t.source.column,...(t.kind==='tag'?{name:t.name}:t.kind==='label'?{name:t.name}:{text:t.text})}]:[]);
  assert.deepEqual(controls(ir.tokens),controls(native),`${locale}/${spec.id} native control order`);assert.equal(ir.tokens.filter(t=>t.kind==='page-start').length,ir.extraction.pages.length);assert.equal(ir.tokens.filter(t=>t.kind==='page-end').length,ir.extraction.pages.length);assert.equal(ir.localized.size,ir.extraction.pages.length);assert.ok(ir.extraction.pages.length>0);
  const tags=ir.tokens.filter(t=>t.kind==='tag');assert.ok(tags.some(t=>t.name==='jump'&&t.args.storage===(spec.id==='interlude1'?'scenario2.ks':'scenario3.ks')),`${locale}/${spec.id} successor remains explicit`);
  if(spec.id==='door2')assert.ok(ir.tokens.some(t=>t.kind==='label'&&t.name==='second20'),`${locale} second interlude retained`);
  rows.push({locale,chapter:spec.id,paragraphs:ir.extraction.pages.length,tokens:ir.tokens.length,labels:ir.tokens.filter(t=>t.kind==='label').length,scripts:ir.tokens.filter(t=>t.kind==='script').length,tagKinds:[...new Set(tags.map(t=>t.name))].sort(),dynamicAttributes:tags.flatMap(t=>t.attributes).filter(a=>a.mode!=='literal').length,playable:false});
 }
 await mkdir('artifacts/wheel-memory',{recursive:true});await writeFile('artifacts/wheel-memory/next-door-ir.json',JSON.stringify(rows,null,2)+'\n');console.log(rows.map(({tagKinds,...r})=>({...r,tagKinds:tagKinds.length})));
});
