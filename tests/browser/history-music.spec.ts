import {test,expect} from '@playwright/test';
import {sourceCut} from './chapter-helpers.js';
declare global {interface Window {__historyMusic?:HTMLMediaElement[];}}
test('the actual chapter history freezes narrative while versioned music continues',async({page})=>{
 await page.addInitScript(()=>{window.__historyMusic=[];const original=AudioContext.prototype.createMediaElementSource;AudioContext.prototype.createMediaElementSource=function(element){window.__historyMusic!.push(element);return original.call(this,element);};});
 const time=new Date('2026-10-29T00:00:00Z');await page.clock.install({time});await page.clock.pauseAt(new Date(time.getTime()+1000));await sourceCut(page,'en','page-1500');
 const before=await page.evaluate(async()=>{const p=window.__fataTest!.player()!;await p.showSystemScreen('history');const media=[...window.__historyMusic!].reverse().find(m=>!m.paused&&m.duration>20);if(!media)throw new Error('Missing actual music');return {src:media.currentSrc,time:media.currentTime,logical:p.capture().logicalTime,pc:p.capture().frames};});
 await page.waitForTimeout(500);await page.clock.runFor(1000);
 const after=await page.evaluate(src=>{const p=window.__fataTest!.player()!,m=[...window.__historyMusic!].reverse().find(m=>m.currentSrc===src&&!m.paused);return {playing:!!m,time:m?.currentTime,logical:p.capture().logicalTime,pc:p.capture().frames,error:p.getSnapshot().error};},before.src);
 expect(new URL(before.src).searchParams.get('galbox-version')).toMatch(/^sha256-[a-f0-9]{64}$/u);expect(after.playing).toBe(true);expect(after.time).toBeGreaterThan(before.time);expect(after.logical).toBe(before.logical);expect(after.pc).toEqual(before.pc);expect(after.error).toBeNull();
});
