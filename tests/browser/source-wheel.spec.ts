import {test,expect} from '@playwright/test';
import {sourceCut} from './chapter-helpers.js';
import {presentation} from './helpers.js';
const time=new Date('2026-10-30T00:00:00Z');
test.beforeEach(async({page})=>{await page.clock.install({time});await page.clock.pauseAt(new Date(time.getTime()+1000));});

test('actual reading wheel follows consecutive notches and history scroll/return without consuming the closing gesture',async({page})=>{
 test.setTimeout(120000);await sourceCut(page,'en','page-500');await page.evaluate(()=>window.__fataTest!.player()!.updatePreferences({text:{intervalMs:200}}));await page.clock.runFor(250);
 const first=await page.evaluate(()=>window.__fataTest!.player()!.capture().text!.textId),surface=page.locator('.advance-surface');await surface.hover();await page.mouse.wheel(0,120);
 await expect.poll(()=>page.evaluate(()=>{const t=window.__fataTest!.player()!.capture().text!;return t.revealed===Array.from(t.content).length;})).toBe(true);expect(await page.evaluate(()=>window.__fataTest!.player()!.capture().text!.textId)).toBe(first);
 await page.clock.runFor(40);await page.mouse.wheel(0,120);await expect.poll(()=>page.evaluate(()=>window.__fataTest!.player()!.capture().text?.textId)).not.toBe(first);
 const next=await page.evaluate(()=>window.__fataTest!.player()!.capture().text?.textId);await surface.hover();await page.mouse.wheel(0,-120);const history=page.locator('.source-history');await expect(history).toBeVisible();expect(await history.evaluate(el=>el.style.top)).toBe('40px');const before=await history.evaluate(el=>el.scrollTop);expect(before).toBeGreaterThan(25);
 await page.clock.runFor(50);await history.hover();await page.mouse.wheel(0,120);await expect(history).toBeVisible();await page.mouse.wheel(0,-120);await expect.poll(()=>history.evaluate(el=>el.scrollTop)).toBeCloseTo(before-25,0);
 await page.mouse.wheel(0,120);await expect.poll(()=>history.evaluate(el=>el.scrollTop)).toBeCloseTo(before,0);await page.clock.runFor(160);await page.mouse.wheel(0,120);await expect(history).toHaveCount(0);
 await surface.hover();await page.mouse.wheel(0,120);expect(await page.evaluate(()=>window.__fataTest!.player()!.capture().text?.textId)).toBe(next);expect(await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().error)).toBeNull();
});

test('source save/load wheel changes pages cyclically and right click cancels only the top window',async({page})=>{
 test.setTimeout(120000);await sourceCut(page,'en','page-500');const first=await page.evaluate(async()=>{const p=window.__fataTest!.player()!;for(let i=0;i<5;i++)await p.save('wheel-'+i);await p.showSystemScreen('save');return p.capture().text?.textId;});
 const current=page.locator('.memory-pages [aria-current=page]');await page.locator('.menu-plane').hover({position:{x:30,y:30}});await expect(current).toHaveText('1');await page.mouse.wheel(0,120);await expect(current).toHaveText('2');await page.mouse.wheel(0,120);await expect(current).toHaveText('3');await page.mouse.wheel(0,120);await expect(current).toHaveText('1');await page.mouse.wheel(0,-120);await expect(current).toHaveText('3');
 await page.locator('.menu-plane').click({button:'right',position:{x:20,y:20}});await expect(page.locator('.menu-overlay')).toHaveCount(0);await page.evaluate(()=>window.__fataTest!.player()!.showSystemScreen('load'));const count=await page.locator('.memory-pages button').count();expect(count).toBeGreaterThan(1);await page.locator('.menu-plane').hover({position:{x:30,y:30}});await page.mouse.wheel(0,-120);await expect(current).toHaveText(String(count));
 await page.locator('.memory-card:not(:disabled)').first().click();await expect(page.locator('.menu-confirm')).toBeVisible();await page.locator('.menu-confirm p').click({button:'right'});await expect(page.locator('.menu-confirm')).toHaveCount(0);await expect(page.locator('.menu-overlay')).toBeVisible();await page.locator('.menu-plane').click({button:'right',position:{x:20,y:20}});await expect(page.locator('.menu-overlay')).toHaveCount(0);
 expect(await page.evaluate(()=>window.__fataTest!.player()!.capture().text?.textId)).toBe(first);expect(await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().error)).toBeNull();
});

test('wheel device preference persists and changing it does not disable reading input',async({page})=>{
 await page.goto('/?lang=en&__test');await presentation(page,'title');await page.locator('[data-title-action=config]').click();const mode=page.getByRole('combobox',{name:'Wheel input',exact:true});await expect(mode).toHaveValue('step');await mode.selectOption('gesture');await expect(page.getByRole('checkbox',{name:'Mouse wheel reading'})).toBeChecked();await expect.poll(()=>page.evaluate(()=>window.__fataTest!.player()!.exportPreferences().input.wheelMode)).toBe('gesture');
 await page.reload();await presentation(page,'title');await page.locator('[data-title-action=config]').click();await expect(page.getByRole('combobox',{name:'Wheel input',exact:true})).toHaveValue('gesture');await page.locator('.menu-plane').click({button:'right',position:{x:20,y:20}});await expect(page.locator('.menu-overlay')).toHaveCount(0);
});
