import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sourceHistoryProfile,historyAnnotation} from "../../tooling/source-history-profile.js";
import {tokenize} from "../../tooling/kag.js";
import {languages} from "../../tooling/locale.js";
test('reads eight source history policies and guarded literal annotations without execution',async()=>{
 for(const locale of languages){const p=await sourceHistoryProfile(locale);assert.equal(p.maxLines,['zh','jp','ko'].includes(locale)?2000:500);assert.equal(p.wrapping,['zh','jp'].includes(locale)?'incremental':'deferred');}
 const p=await sourceHistoryProfile('en'),tags=tokenize('[hisname name="Keeper"][hisout txt="Memo"]','synthetic.ks');assert.equal(tags[0]?.kind,'tag');assert.equal(tags[1]?.kind,'tag');if(tags[0]?.kind!=='tag'||tags[1]?.kind!=='tag')throw new Error('tags');assert.equal(historyAnnotation(tags[0],p).text,'    - Keeper -');assert.equal(historyAnnotation(tags[1],p).text,'Memo');assert.equal(historyAnnotation(tags[1],p).append,true);
 const dynamic=tokenize('[hisout txt=&unknown()]','synthetic.ks')[0];if(dynamic?.kind!=='tag')throw new Error('dynamic');assert.throws(()=>historyAnnotation(dynamic,p));
});
