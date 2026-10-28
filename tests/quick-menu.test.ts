import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readQuickMenu,quickActions} from '../tooling/quick-menu.js';
import {languages} from '../tooling/locale.js';
test('quick-menu buttons and hover region come from all eight source systems, excluding commented buttons',async()=>{for(const locale of languages){const source=await readFile(`private/text/${locale}/system/MainWindow.tjs`,'utf8'),q=readQuickMenu(source);assert.deepEqual(q.buttons.map(b=>b.action),quickActions);assert.deepEqual(q.zone,locale==='jp'||locale==='zh'?{x:480,y:550,width:270,height:50}:{x:509,y:510,width:241,height:90});assert.deepEqual(q.buttons.map(b=>[b.x,b.y]),quickActions.map((_,i)=>[509+26*i,510]));assert.throws(()=>readQuickMenu(source.replace('kag.configQExecMenuClick()','kag.unknownQExecMenuClick()')),/QUICK_MENU/);}});
