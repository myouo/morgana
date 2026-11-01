import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {decodeWire} from 'galbox-sdk/wire';

test('corrupt source module is rejected before startup and a clean retry restores the title',async({page})=>{
 const root=process.env.FATA_INTERFACE_ROOT??'generated/interactions',m=decodeWire('ModuleManifest',new Uint8Array(await readFile(root+'/programs/en.modules.pb'))),entry=m.modules.find(v=>v.functions.some(f=>f.id===m.header.entry));if(!entry)throw new Error('entry module');const bytes=await readFile(root+'/'+entry.uri);let corrupt=true;
 await page.route('**/'+entry.uri,async route=>{if(!corrupt){await route.continue();return;}corrupt=false;const bad=Buffer.from(bytes);bad[Math.floor(bad.length/2)]!^=1;await route.fulfill({contentType:'application/x-protobuf',body:bad});});await page.goto('/?lang=en&__test');await expect(page.locator('.resource-error')).toBeVisible({timeout:90000});await page.locator('.resource-error button').click();await expect.poll(()=>page.evaluate(()=>{const p=window.__fataTest?.player(),v=p?.getSnapshot(),w=v?.core?.run.wait;if(v?.error)throw new Error(v.error);return v?.lifecycle==='playing'&&v.loading.phase==='idle'&&!!w;}),{timeout:90000}).toBe(true);
 for(let i=0;i<8;i++){const w=await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().core?.run.wait?.kind);if(w==='choice')break;const b=await page.locator('.game').boundingBox();if(b)await page.mouse.click(b.x+b.width*.45,b.y+b.height*.8);await page.waitForTimeout(100);}await expect(page.locator('[data-title-action=start]')).toBeVisible();expect(await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().error)).toBeNull();
});
