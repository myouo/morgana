import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {tokenize} from '../tooling/kag.js';
import {languages} from '../tooling/locale.js';
test('the original Departed check runs only at the ninth ending, after the completion flag',async()=>{
 for(const locale of languages)for(const file of ['scenario','scenario2','scenario3','search','scenario4','scenario5','scenario6','search2','scenario7','scenario8','scenario9']){
  const tags=tokenize(await readFile(`private/text/${locale}/scenario/${file}.ks`,'utf8'),file+'.ks').filter(t=>t.kind==='tag'),checks=tags.filter(t=>t.name==='check_ach_departed');assert.equal(checks.length,file==='scenario9'?1:0,locale+'/'+file);
  if(checks.length){const complete=tags.find(t=>t.name==='eval'&&t.args.exp?.replace(/\s/gu,'')==='sf.fataend=true');assert.ok(complete);assert.ok(complete.source.line<checks[0]!.source.line);}
 }
});
