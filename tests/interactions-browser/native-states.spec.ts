import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {decodeWire} from 'galbox-sdk/wire';
import type {Player} from 'galbox-sdk/player';
declare global {interface Window {__nativeUiProbe?:{child:Player;mount:HTMLElement};}}

test('source investigation retains native hover and pressed frames in the real SDK UI',async({page})=>{
 await page.goto('/?lang=zh&__test');await expect.poll(()=>page.evaluate(()=>window.__fataTest?.player()?.getSnapshot().lifecycle),{timeout:90000}).toBe('playing');
 for(let n=0;n<10;n++){const kind=await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().core?.run.wait?.kind);if(kind==='choice')break;const r=await page.locator('.game').boundingBox();if(r)await page.mouse.click(r.x+r.width*.45,r.y+r.height*.8);await page.waitForTimeout(100);}
 const raw:unknown=decodeWire('PortableBackup',new Uint8Array(await readFile('generated/interfaces-shared/cuts/zh-badend.pb')));await page.evaluate(async raw=>{const p=window.__fataTest!.player()!,plan=await p.prepareBackupRestoreAsync(raw),receipt=await p.commitBackupRestore(plan);await p.load(receipt.slots[0]!.restoredSlot);},raw);
 await expect.poll(()=>page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().core?.run.wait?.at),{timeout:90000}).toBe('title:wait');
 await page.evaluate(async()=>{const p=window.__fataTest!.player()!,mount=document.createElement('div');mount.style.cssText='position:absolute;inset:0;z-index:50';document.querySelector('.game')!.append(mount);const child=await p.openSceneReplay('search',mount);window.__nativeUiProbe={child,mount};await child.updatePreferences({text:{intervalMs:0}});});
 try{
  for(let n=0;n<1000;n++){const ready=await page.evaluate(async()=>{const p=window.__nativeUiProbe!.child,v=p.getSnapshot(),w=v.core?.run.wait;if(v.error)throw new Error(v.error);if(v.loading.phase==='idle'&&w?.kind==='ui')return true;if(v.loading.phase==='idle'&&w&&(w.kind==='text'||((w.kind==='group'||w.kind==='delay')&&w.prompt!==undefined)))await p.step(w.prompt!,v.epoch);return false;});if(ready)break;await page.waitForTimeout(10);}
  const id=await page.evaluate(()=>window.__nativeUiProbe!.child.getSnapshot().core?.run.ui?.active?.screen.controls.find(c=>c.kind==='button'&&c.visible&&c.enabled)?.id);if(!id)throw new Error('source question menu');const button=page.locator('[data-ui-control="'+id+'"]');await button.hover();await expect(button).toHaveCSS('background-position','100% 0px');await page.mouse.down();await expect(button).toHaveCSS('background-position','50% 0px');await page.mouse.move(1,1);await page.mouse.up();await expect(button).toHaveCSS('background-position','0px 0px');
 }finally{await page.evaluate(async()=>{await window.__fataTest!.player()!.closeExtra();window.__nativeUiProbe?.mount.remove();delete window.__nativeUiProbe;});}
});
