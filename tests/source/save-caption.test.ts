import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {saveEmptyCaption} from "../../tooling/save-artwork.js";
test('empty-bookmark captions retain the actual eight-language literals, including a blank French caption',async()=>{
 for(const [locale,expected]of Object.entries({en:'No Data',fr:'',it:'Nessun Dato',jp:'情報なし',ko:'No Data','pt-br':'Sem Dados',ru:'Нет Данных',zh:'没有记忆'}))assert.equal(saveEmptyCaption(await readFile(`private/text/${locale}/scenario/saveload.ks`,'utf8')),expected);
 assert.throws(()=>saveEmptyCaption("var str = kag.bookMarkNames[num]; if(str == '') str = dynamicValue;"),/SAVE_EMPTY_CAPTION_LITERAL/);
});
