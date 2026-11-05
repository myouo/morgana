import {test,expect} from '@playwright/test';
import type {Page} from '@playwright/test';
async function ready(page:Page){await expect.poll(()=>page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot();if(v?.error)throw new Error(v.error);return v?.core?.run.wait?.at==='title:wait'&&v.loading.phase==='idle';}),{timeout:90000}).toBe(true);}
for(const locale of ['zh','en'])test(locale+' title loads independent metadata in parallel and retains its original controls',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto('/?lang='+locale+'&__test');await ready(page);
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').filter((e):e is PerformanceResourceTiming=>e.entryType==='resource'&&/\/text\/(?:history|chapters|save-names)\//u.test(e.name)).map(e=>({start:e.startTime,end:e.responseEnd,path:new URL(e.name).pathname})));
 expect(resources).toHaveLength(16);const first=resources.slice().sort((a,b)=>a.start-b.start).slice(0,4);expect(Math.max(...first.map(r=>r.start))).toBeLessThan(Math.min(...first.map(r=>r.end)));expect(errors).toEqual([]);
 await expect(page.locator('[data-title-action=start]')).toBeVisible();await page.locator('[data-title-action=config]').click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 await page.locator('.game').screenshot({path:`artifacts/startup-optimization/${locale}-title.png`});
});
test('a corrupt presentation fragment blocks startup and the original retry starts a fresh valid load',async({page})=>{
 let damaged=false;await page.route('**/text/history/*.pb',async route=>{if(damaged){await route.continue();return;}damaged=true;const original=await route.fetch(),bytes=Buffer.from(await original.body());bytes[bytes.length-1]=bytes[bytes.length-1]!^1;await route.fulfill({response:original,body:bytes});});
 await page.goto('/?lang=zh&__test');await expect(page.locator('.resource-error')).toBeVisible();expect(await page.evaluate(()=>!!window.__fataTest)).toBe(false);await expect(page.locator('[data-title-action=start]')).toHaveCount(0);
 await page.unroute('**/text/history/*.pb');await page.locator('.resource-error button').click();await ready(page);await expect(page.locator('.resource-error')).toHaveCount(0);await expect(page.locator('[data-title-action=start]')).toBeVisible();
});
