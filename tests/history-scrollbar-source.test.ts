import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {historyScrollbarProfile} from '../src/history-scrollbar.js';
import {languages} from '../tooling/locale.js';
test('the history slider skin keeps actual eight-language Override geometry and colors',async()=>{for(const locale of languages){const source=await readFile(`private/text/${locale}/system/Override.tjs`,'utf8'),profile=historyScrollbarProfile(locale);for(const [key,value]of [['Width',profile.width],['Height',profile.height],['Left',profile.left],['Top',profile.top]])assert.equal(Number(new RegExp(';scrollBar'+key+'\\s*=\\s*(\\d+)').exec(source)?.[1]),value);assert.match(source,/;scrollBarBaseColor\s*=\s*0x1c1f2d/u);assert.match(source,/;scrollBarSliderColor\s*=\s*0x000000/u);}});
