import {readFile} from 'node:fs/promises';
import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {decodeWire} from 'galbox-sdk/wire';
import {menuWords} from '../../src/translations.js';
const root='generated/native-connected',bytes=async(p:string)=>(await readFile(p)).toString('base64');
async function until(page:Page,kind:'title'|'ui'|'ninth'){
 const deadline=Date.now()+90000;
 while(Date.now()<deadline){
  const s=await page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot(),w=v?.core?.run.wait;if(v?.error)throw new Error(v.error);return {ready:v?.lifecycle==='playing'&&v.loading.phase==='idle',at:w?.at,kind:w?.kind,prompt:w&&(w.kind==='group'||w.kind==='delay')?w.prompt:undefined};});
  if(s.ready&&(kind==='title'?s.at==='title:wait':kind==='ui'?s.kind==='ui':s.kind==='text'&&s.at?.startsWith('ninth/')))return;
  if(s.ready&&s.prompt!==undefined){const r=await page.locator('.game').boundingBox();if(r)await page.mouse.click(r.x+r.width*.45,r.y+r.height*.8);}else await page.waitForTimeout(100);
 }
 throw new Error('Native browser did not reach '+kind);
}
async function oldEndpoint(page:Page,base:string){
 await page.goto('/?lang=zh&__test');await until(page,'title');
 const release=await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().core!.run.release);test.info().annotations.push({type:'release',description:release});
 const manifest=await bytes(base+'/programs/zh.modules.pb'),snapshot=await bytes(base+'/cuts/zh-ended.snapshot.pb'),profile=await bytes(base+'/cuts/zh-ended.profile.pb');
 const slot=await page.evaluate(({manifest,snapshot,profile})=>window.__fataTest!.seedCut(manifest,snapshot,profile),{manifest,snapshot,profile});
 await page.evaluate(slot=>window.__fataTest!.player()!.load(slot),slot);
}
async function oldClearedTitle(page:Page){await oldEndpoint(page,'generated/ninth-connected');await until(page,'title');}
test('native chapter selection stays in the main player and saves across refresh',async({page})=>{
 const words=menuWords(decodeWire('InterfaceTextCatalog',new Uint8Array(await readFile(root+'/text/zh.ui.pb'))));
 await oldClearedTitle(page);await page.locator('[data-title-action=extra]').click();await until(page,'ui');
 await expect(page.locator('.source-replay-menu')).toHaveCount(0);
 await page.locator('[data-ui-control=menu-chapter]').click();await until(page,'ui');
 for(let n=0;n<5;n++){await page.locator(`[data-ui-control=menu-next-${n}]`).click();await until(page,'ui');}
 // The source forbids opening the quick menu while the chapter book is active.
 await page.locator('.game').click({button:'right'});await page.keyboard.press('Escape');
 await expect(page.locator('[data-ui-control=menu-door9]')).toBeVisible();
 await page.locator('[data-ui-control=menu-door9]').click();await until(page,'ninth');
 const before=await page.evaluate(async()=>{const p=window.__fataTest!.player()!,v=p.getSnapshot();if(v.extraSession||v.core!.run.replayScene)throw new Error('Native selection opened a temporary replay');await p.setAuto(false);await p.showSystemScreen('save');return {frames:p.capture().frames,textId:p.capture().text!.textId};});
 await page.locator('[data-save-slot="memory:1"] .save-card-hit').click();await page.getByRole('button',{name:words.yes,exact:true}).click();
 await expect.poll(()=>page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().slots.find(s=>s.slot.endsWith('memory:1'))?.revision)).toBe(1);
 const saved=await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().slots.find(s=>s.slot.endsWith('memory:1'))!);expect(saved.capture?.textId).toBe(before.textId);
 await page.reload();await until(page,'title');await page.evaluate(async slot=>{const p=window.__fataTest!.player()!;p.setPaused(true);await p.load(slot);},saved.slot);await until(page,'ninth');
 expect(await page.evaluate(()=>{const p=window.__fataTest!.player()!;return {frames:p.capture().frames,textId:p.capture().text!.textId};})).toEqual(before);
 await page.locator('.game').screenshot({path:'artifacts/native-connected/zh-saved-ninth.png'});
});
test('native book and extras index return to the title',async({page})=>{
 await oldClearedTitle(page);await page.locator('[data-title-action=extra]').click();await until(page,'ui');
 await page.locator('[data-ui-control=menu-chapter]').click();await until(page,'ui');
 await page.locator('[data-ui-control=menu-title-0]').click();await until(page,'title');
 await page.locator('[data-title-action=extra]').click();await until(page,'ui');
 await page.locator('[data-ui-control=menu-titleback]').click();await until(page,'title');
 expect(await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().core!.run.globals['original.native-menu-active']?.value)).toBe(false);
});
test('recorded eighth endpoint still enters ninth in the main player',async({page})=>{
 await oldEndpoint(page,'generated/eighth-connected');await until(page,'ninth');
 const state=await page.evaluate(()=>{const v=window.__fataTest!.player()!.getSnapshot();return {frame:v.core!.run.frames[0]!.functionId,replay:v.core!.run.replayScene,extraSession:v.extraSession};});
 expect(state.frame).toBe('main');expect(state.replay).toBeFalsy();expect(state.extraSession).toBeFalsy();
});
