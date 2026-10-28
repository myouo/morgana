import {test,expect} from '@playwright/test';
import {presentation} from './helpers.js';
test.use({viewport:{width:844,height:390},isMobile:true,hasTouch:true});
const time=new Date('2026-10-28T00:00:00Z');
test.beforeEach(async({page})=>{await page.clock.install({time});await page.clock.pauseAt(new Date(time.getTime()+1000));});
test('mobile start requests native fullscreen from the gesture and keeps the original game aspect',async({page})=>{
 await page.goto('/?lang=en&__test');await presentation(page,'title');await page.locator('[data-title-action=start]').tap();await expect.poll(()=>page.evaluate(()=>document.fullscreenElement?.id)).toBe('root');await expect(page.locator('.title-screen')).toHaveCount(0);const box=await page.locator('.game').boundingBox();expect(box).not.toBeNull();expect(box!.width/box!.height).toBeCloseTo(4/3,3);expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.y).toBeGreaterThanOrEqual(0);await page.evaluate(()=>document.exitFullscreen());await page.clock.runFor(32);const view=await page.evaluate(()=>window.__fataTest?.player()?.getSnapshot());expect(view?.lifecycle).toBe('playing');expect(view?.error).toBeNull();
});
test('unavailable fullscreen and a changing visual viewport keep game and menu controls visible',async({page})=>{
 await page.addInitScript(()=>{const viewport=new EventTarget();Object.assign(viewport,{width:844,height:290,offsetTop:25,offsetLeft:0});Object.defineProperty(window,'visualViewport',{value:viewport});Object.defineProperty(document,'fullscreenEnabled',{value:false});});
 await page.goto('/?lang=zh&__test');await presentation(page,'title');const check=async(top:number,height:number)=>{await page.clock.runFor(32);const game=await page.locator('.game').boundingBox();expect(game).not.toBeNull();expect(game!.y).toBeGreaterThanOrEqual(top-.1);expect(game!.y+game!.height).toBeLessThanOrEqual(top+height+.1);expect(game!.width/game!.height).toBeCloseTo(4/3,3);};await check(25,290);
 await page.locator('[data-title-action=config]').tap();for(const button of await page.locator('.menu-plane .art-button').all()){const b=await button.boundingBox();expect(b!.y).toBeGreaterThanOrEqual(25);expect(b!.y+b!.height).toBeLessThanOrEqual(315);}await page.getByRole('button',{name:'返回',exact:true}).tap();
 await page.evaluate(()=>{const viewport=window.visualViewport;if(!viewport)throw new Error('Missing test viewport');Object.assign(viewport,{width:390,height:680,offsetTop:10});viewport.dispatchEvent(new Event('resize'));});await page.setViewportSize({width:390,height:740});await check(10,680);await page.locator('[data-title-action=start]').tap();await expect(page.locator('.title-screen')).toHaveCount(0);expect(await page.evaluate(()=>document.fullscreenElement)).toBeNull();
});
test('a rejected fullscreen request does not block mobile story start',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(document,'fullscreenEnabled',{value:true});HTMLElement.prototype.requestFullscreen=()=>Promise.reject(new DOMException('Denied by browser','NotAllowedError'));});await page.goto('/?lang=en&__test');await presentation(page,'title');await page.locator('[data-title-action=start]').tap();await expect(page.locator('.title-screen')).toHaveCount(0);expect(await page.evaluate(()=>window.__fataTest?.player()?.getSnapshot().error)).toBeNull();
});
