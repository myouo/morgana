import {readFile} from 'node:fs/promises';
import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {decodeWire} from 'galbox-sdk/wire';
import {menuWords} from '../../src/translations.js';
const root='generated/bonus-connected',bytes=async(p:string)=>(await readFile(p)).toString('base64');
async function until(page:Page,kind:'title'|'ui'|'bonus',advanceText=false){
 const deadline=Date.now()+120000;
 while(Date.now()<deadline){
  const state=await page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot(),w=v?.core?.run.wait;if(v?.error)throw new Error(v.error);return {ready:v?.lifecycle==='playing'&&v.loading.phase==='idle',at:w?.at,kind:w?.kind,prompt:w&&(w.kind==='group'||w.kind==='delay'||w.kind==='text')?w.prompt:undefined};});
  if(state.ready&&(kind==='title'?state.at==='title:wait':kind==='ui'?state.kind==='ui':state.kind==='text'&&state.at?.startsWith('bonus/')))return;
  if(state.ready&&state.prompt!==undefined&&(state.kind!=='text'||advanceText))await page.evaluate(async()=>{const p=window.__fataTest!.player()!,v=p.getSnapshot(),w=v.core!.run.wait;if(w&&(w.kind==='group'||w.kind==='delay'||w.kind==='text')&&w.prompt!==undefined)await p.step(w.prompt,v.epoch);});
  else await page.waitForTimeout(100);
 }
 throw new Error('Bonus browser did not reach '+kind);
}
async function seed(page:Page,locale:string,cut:string){const manifest=await bytes(`${root}/programs/${locale}.modules.pb`),snapshot=await bytes(`${root}/cuts/${locale}-${cut}.snapshot.pb`),profile=await bytes(`${root}/cuts/${locale}-${cut}.profile.pb`);return page.evaluate(({manifest,snapshot,profile})=>window.__fataTest!.seedCut(manifest,snapshot,profile),{manifest,snapshot,profile});}
async function openWithFixture(page:Page,locale:string){
 await page.goto(`/?lang=${locale}&__test`);await until(page,'title');const slot=await seed(page,locale,'start');await page.evaluate(async slot=>{const p=window.__fataTest!.player()!;await p.load(slot);await p.start(p.getSnapshot().profileId);},slot);await until(page,'title');
 test.info().annotations.push({type:'release',description:await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().core!.run.release)});
}
test('Chinese all-ending bonus enters the main player and survives illustrated save and refresh',async({page})=>{
 const locale='zh',words=menuWords(decodeWire('InterfaceTextCatalog',new Uint8Array(await readFile(`${root}/text/${locale}.ui.pb`))));
 await openWithFixture(page,locale);await page.locator('[data-title-action=extra]').click();await until(page,'ui');await page.locator('[data-ui-control=menu-endinglist]').click();await until(page,'ui');await expect(page.locator('[data-ui-control=menu-bonus-prologue]')).toBeVisible();await page.locator('.game').screenshot({path:'artifacts/bonus-connected/zh-ending-list.png'});
 await page.locator('[data-ui-control=menu-bonus-prologue]').click();await until(page,'bonus');
 const before=await page.evaluate(async()=>{const p=window.__fataTest!.player()!,v=p.getSnapshot();if(v.extraSession||v.core!.run.replayScene||v.core!.run.audioState?.gains.bgm!==1)throw new Error('Bonus main authority/audio');await p.setAuto(false);await p.showSystemScreen('save');return {frames:p.capture().frames,textId:p.capture().text!.textId,read:p.getSnapshot().core!.profile.read.length};});
 await page.locator('[data-save-slot="memory:1"] .save-card-hit').click();await page.getByRole('button',{name:words.yes,exact:true}).click();await expect.poll(()=>page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().slots.find(s=>s.slot.endsWith('memory:1'))?.revision)).toBe(1);
 const saved=await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().slots.find(s=>s.slot.endsWith('memory:1'))!);await page.reload();await until(page,'title');await page.evaluate(async slot=>{const p=window.__fataTest!.player()!;p.setPaused(true);await p.load(slot);},saved.slot);await until(page,'bonus');
 expect(await page.evaluate(()=>{const p=window.__fataTest!.player()!;return {frames:p.capture().frames,textId:p.capture().text!.textId,read:p.getSnapshot().core!.profile.read.length};})).toEqual(before);await page.locator('.game').screenshot({path:'artifacts/bonus-connected/zh-cold-bonus.png'});
});
test('Chinese bonus follows its original return to title without losing full progress',async({page})=>{
 const locale='zh';await page.goto(`/?lang=${locale}&__test`);await until(page,'title');const last=await seed(page,locale,'last');await page.evaluate(async slot=>{const p=window.__fataTest!.player()!;await p.load(slot);await p.setAuto(false);},last);await until(page,'title',true);
 const expected=decodeWire('Profile',new Uint8Array(await readFile(`${root}/cuts/${locale}-last.profile.pb`))).read.length;expect(await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().core!.profile.read.length)).toBeGreaterThanOrEqual(expected);
});
test('English bonus returns to its original ending list and restores the title background',async({page})=>{
 const locale='en';await page.goto(`/?lang=${locale}&__test`);await until(page,'title');const last=await seed(page,locale,'last');await page.evaluate(async slot=>{const p=window.__fataTest!.player()!;p.setPaused(true);await p.load(slot);await p.start(p.getSnapshot().profileId);p.setPaused(false);},last);await until(page,'title');const title=await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().core!.run.stage.find(o=>o.id==='background')!.asset);await page.evaluate(async slot=>{const p=window.__fataTest!.player()!;await p.load(slot);await p.setAuto(false);},last);await until(page,'ui',true);
 await expect(page.locator('[data-ui-control=menu-bonus-prologue]')).toBeVisible();expect(await page.evaluate(()=>{const v=window.__fataTest!.player()!.getSnapshot();return {main:v.core!.run.frames[0]!.functionId,story:v.core!.run.stage.some(o=>o.id.startsWith('door:')),active:v.core!.run.globals['original.native-menu-active']?.value,session:!!v.extraSession};})).toEqual({main:'main',story:false,active:true,session:false});await page.locator('.game').screenshot({path:'artifacts/bonus-connected/en-returned-ending-list.png'});
 await page.locator('[data-ui-control=menu-ending-title]').click();await until(page,'title');expect(await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().core!.run.stage.find(o=>o.id==='background')!.asset)).toBe(title);await page.locator('.game').screenshot({path:'artifacts/bonus-connected/en-returned-title.png'});
});
