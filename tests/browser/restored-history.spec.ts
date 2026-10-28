import {test,expect} from '@playwright/test';
import {sourceCut} from './chapter-helpers.js';
import {presentation} from './helpers.js';
import {storyBoundary,finishParagraph} from './story-flow.js';
const time=new Date('2026-10-28T00:00:00Z');
test.beforeEach(async({page})=>{await page.clock.install({time});await page.clock.pauseAt(new Date(time.getTime()+1000));});
for(const entry of ['quick','menu','refresh','ended'] as const)test(`loaded ${entry} save keeps historical text and accepts wheel history`,async({page})=>{
 // The ended case traverses the entire 93-page chapter before capture and reload. Other restore cases keep their prior bound.
 test.setTimeout(entry==='ended'?300000:120000);await page.goto('/?lang=zh&__test');await presentation(page,'title');await page.locator('[data-title-action=start]').click();await presentation(page,'text');await page.evaluate(async()=>{const p=window.__fataTest?.player();if(!p)throw new Error('player');await p.updatePreferences({text:{intervalMs:0},input:{wheel:true}});for(let i=0;i<5;i++){const v=p.getSnapshot(),w=v.core?.run.wait;if(w?.kind!=='text')throw new Error('wait');await p.input('reveal',w.prompt,v.epoch);await p.input('advance',w.prompt,v.epoch);}});
 if(entry==='ended'){await sourceCut(page,'zh','ended');expect((await storyBoundary(page)).status).toBe('ended');}
 const saved=await page.evaluate(async()=>{const p=window.__fataTest?.player();if(!p)throw new Error('player');await p.quickSave();return {text:p.capture().text?.textId,history:p.getSnapshot().backlog.entries.map(e=>e.text.content)};});expect(saved.history.length).toBeGreaterThan(0);
 if(entry==='refresh'){await page.reload();await presentation(page,'title');await page.locator('[data-title-action=load]').click();}
 else if(entry==='menu'){await page.locator('.stage').focus();await page.keyboard.press('Escape');await page.getByRole('button',{name:'读取记忆',exact:true}).click();}
 if(entry==='menu'||entry==='refresh'){await page.locator('.memory-card:not(:disabled)').first().click();await page.getByRole('button',{name:'确定',exact:true}).click();await expect.poll(async()=>{await page.clock.runFor(16);return page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot();return v?.lifecycle==='playing'&&!v.menu&&v.core?.run.text?.textId;});},{timeout:15000,intervals:[50]}).toBe(saved.text);await expect(page.locator('.menu-overlay')).toHaveCount(0);}
 else await page.evaluate(()=>window.__fataTest?.player()?.quickLoad());
 const restored=await page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot();return {history:v?.backlog.entries.map(e=>e.text.content),paused:v?.paused,wait:v?.core?.run.wait,loading:v?.loading,menu:v?.menu,wheel:v?.preferences.value.input.wheel};});expect(restored.history).toEqual(saved.history);await page.clock.runFor(250);await page.locator(entry==='ended'?'.stage':'.advance-surface').hover();await page.mouse.wheel(0,-120);
 try{await expect(page.getByRole('dialog',{name:'历史记录',exact:true})).toBeVisible();}catch(error){console.error('RESTORED_INPUT',restored,await page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot();return {paused:v?.paused,menu:v?.menu,systemScreen:v?.systemScreen,wait:v?.core?.run.wait,loading:v?.loading,history:v?.backlog.entries.length,error:v?.error};}));throw error;}
 await expect(page.locator('.source-history article')).toHaveCount(saved.history.length);expect(await page.locator('.source-history article p').allTextContents()).toEqual(saved.history);
});
