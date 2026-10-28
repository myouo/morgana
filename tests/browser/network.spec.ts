import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {decodeWire} from 'galbox-sdk/wire';
import {localeInfo} from '../../src/locales.js';
import {presentation} from './helpers.js';
const time=new Date('2026-10-28T00:00:00Z');
test.beforeEach(async({page})=>{await page.clock.install({time});await page.clock.pauseAt(new Date(time.getTime()+1000));});
test('language settings synchronize text/art/fonts/preferences and refresh without requesting a foreign catalog',async({page})=>{
 const requests:string[]=[];page.on('request',r=>requests.push(new URL(r.url()).pathname));await page.goto('/?lang=zh&__test');await presentation(page,'title');await page.locator('[data-title-action=config]').click();await page.getByRole('combobox',{name:'语言',exact:true}).selectOption('jp');await page.getByRole('button',{name:'确定',exact:true}).click();await page.waitForURL(/lang=jp/u);await presentation(page,'title');
 expect(await page.locator('html').getAttribute('lang')).toBe('ja');expect(await page.evaluate(()=>window.__fataTest?.player()?.exportPreferences().locale)).toBe('ja');await page.locator('[data-title-action=config]').click();await expect(page.getByRole('dialog',{name:'設定',exact:true})).toBeVisible();await expect(page.getByRole('combobox',{name:'言語',exact:true})).toHaveValue('jp');await page.reload();await presentation(page,'title');expect(await page.evaluate(()=>window.__fataTest?.player()?.exportPreferences().locale)).toBe('ja');
 expect(requests.filter(p=>p.startsWith('/text/')&&!['/text/locales.pb','/text/zh.ui.pb','/text/zh.story.pb','/text/jp.ui.pb','/text/jp.story.pb'].includes(p))).toEqual([]);
 expect(requests.filter(p=>p.startsWith('/assets/locales/')&&!p.startsWith('/assets/locales/zh-Hans/')&&!p.startsWith('/assets/locales/ja/'))).toEqual([]);
});
test('a failed demand load preserves the current presentation and the visible retry continues once',async({page})=>{
 const p=decodeWire('Program',new Uint8Array(await readFile('generated/site/programs/en.pb'))),target=p.assets.find(a=>a.id==='title-menu');if(!target)throw new Error('menu');let fail=true,requests=0;
 await page.route('**/'+target.path,async route=>{requests++;if(fail)await route.fulfill({status:503,body:'Controlled temporary network failure'});else await route.continue();});await page.goto('/?lang=en&loading=demand&__test');
 // Wait for the real initial resource/activation boundary with the same 15s preparation bound used by the other network paths.
 await presentation(page,'title','title:fade-wait');
 await expect.poll(async()=>{await page.clock.runFor(16);return page.evaluate(()=>window.__fataTest?.player()?.getSnapshot().core?.run.wait?.at);}).toBe('title:fade-wait');await page.clock.fastForward(3100);
 await expect(page.getByRole('alert')).toBeVisible();expect(await page.evaluate(()=>window.__fataTest?.player()?.getSnapshot().loading.phase)).toBe('failed');const before=await page.evaluate(()=>{const p=window.__fataTest?.player(),v=p?.getSnapshot();return {epoch:v?.epoch,canvas:document.querySelector('canvas')?.toDataURL(),profile:v?.core?.profile.read};});
 fail=false;await page.getByRole('button',{name:'Retry',exact:true}).click();await presentation(page,'title');await expect(page.getByRole('alert')).toHaveCount(0);expect(requests).toBe(2);expect(await page.evaluate(()=>window.__fataTest?.player()?.getSnapshot().epoch)).toBe(before.epoch);expect(await page.evaluate(()=>window.__fataTest?.player()?.getSnapshot().core?.profile.read)).toEqual(before.profile);expect(before.canvas).toMatch(/^data:image\/png/u);
});
test('a cold slow connection reaches the source title with a bounded selected-language asset set',async({page,context})=>{
 test.setTimeout(90000);const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});let wireBytes=0;const pending=new Set<string>();cdp.on('Network.requestWillBeSent',event=>pending.add(event.requestId));cdp.on('Network.loadingFailed',event=>pending.delete(event.requestId));cdp.on('Network.loadingFinished',event=>{pending.delete(event.requestId);wireBytes+=event.encodedDataLength;});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:180,downloadThroughput:750000,uploadThroughput:250000});
 const requests:string[]=[];page.on('request',r=>requests.push(new URL(r.url()).pathname));await page.goto('/?lang=fr&__test');await presentation(page,'title');await expect(page.locator('[data-title-action=start]')).toBeVisible();await expect.poll(()=>pending.size,{timeout:15000}).toBe(0);
 const values=await page.evaluate(()=>{const p=window.__fataTest?.player(),v=p?.getSnapshot();return {resources:performance.getEntriesByType('resource').map(e=>({name:e.name,transfer:e.toJSON().transferSize,encoded:e.toJSON().encodedBodySize})),loading:v?.loading,media:v?.media,error:v?.error,locale:p?.exportPreferences().locale};});
 expect(values.error).toBeNull();expect(values.locale).toBe(localeInfo.fr.html);expect(requests.filter(p=>p.startsWith('/assets/locales/')&&!p.startsWith('/assets/locales/fr/'))).toEqual([]);expect(requests.filter(p=>p.startsWith('/text/')&&!['/text/locales.pb','/text/fr.ui.pb','/text/fr.story.pb'].includes(p))).toEqual([]);
 const all=decodeWire('Program',new Uint8Array(await readFile('generated/site/programs/fr.pb')));expect(requests.filter(p=>p.startsWith('/assets/shared/')||p.startsWith('/assets/locales/')).length).toBeLessThan(all.assets.length/2);
 const bodyBytes=wireBytes;expect(bodyBytes).toBeGreaterThan(256*1024);expect(bodyBytes).toBeLessThan(12*1024*1024);await test.info().attach('network-cold-title',{body:JSON.stringify({requests,...values,bodyBytes},null,2),contentType:'application/json'});await cdp.detach();
});
