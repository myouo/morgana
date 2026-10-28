import {test,expect} from '@playwright/test';
import {performance as clock} from 'node:perf_hooks';
import {storyBoundary} from './story-flow.js';
import {presentation} from './helpers.js';
interface ReadingProbe {suspends:number;waits:number;media:HTMLMediaElement[];}
declare global {interface Window {__readingProbe?:ReadingProbe;}}
for(const strategy of [{mode:'demand',pages:0},{mode:'balanced',pages:2},{mode:'balanced',pages:4},{mode:'balanced',pages:8}] as const)test(`real maid dialogue ${strategy.mode}-${strategy.pages} loading records network stalls and continuous music`,async({page,context})=>{
 const {mode,pages}=strategy,readingMs=Number(process.env.FATA_READING_MS??600);test.setTimeout(300000);
 await page.addInitScript(()=>{const p:ReadingProbe={suspends:0,waits:0,media:[]};window.__readingProbe=p;const suspend=AudioContext.prototype.suspend;AudioContext.prototype.suspend=function(){p.suspends++;return suspend.call(this);};const source=AudioContext.prototype.createMediaElementSource;AudioContext.prototype.createMediaElementSource=function(el){p.media.push(el);el.addEventListener('waiting',()=>p.waits++);return source.call(this,el);};});
 const time=new Date('2026-10-29T00:00:00Z');await page.clock.install({time});await page.clock.pauseAt(new Date(time.getTime()+1000));
 const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:180,downloadThroughput:750000,uploadThroughput:250000});
 const coldStart=clock.now();await page.goto(`/?lang=en&loading=${mode}&__test`);await expect.poll(async()=>{await page.clock.runFor(16);return page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot();if(v?.error)throw new Error(v.error);return v?.lifecycle==='playing';});},{timeout:60000,intervals:[50]}).toBe(true);const coldStartMs=clock.now()-coldStart;await presentation(page,'title');await page.locator('[data-title-action=start]').click();await page.evaluate(pages=>window.__fataTest?.player()?.updatePreferences({text:{intervalMs:0},prefetchPages:pages}),pages);
 const rows:{id:string;advanceMs:number;suspends:number;waits:number;resident:number;music:boolean}[]=[];
 for(let step=0;step<200;step++){
  const boundary=await storyBoundary(page);if(boundary.status==='ended'||await page.evaluate(()=>window.__fataTest?.player()?.getSnapshot().core?.run.frames.some(f=>f.functionId==='door1')))break;
  if(boundary.wait?.kind==='choice'){await page.locator('.source-choice-option').first().click();continue;}
  if(boundary.wait?.kind!=='text'||!boundary.id)throw new Error('Reading boundary');
  await page.evaluate(async()=>{const p=window.__fataTest!.player()!,v=p.getSnapshot(),w=v.core?.run.wait;if(w?.kind==='text')await p.input('reveal',w.prompt,v.epoch);});
  const measured=boundary.wait.at.startsWith('prologue:');
  if(measured){ // Real reading time gives asynchronous prefetch the same opportunity for both policies.
   await new Promise(resolve=>setTimeout(resolve,readingMs));
   await page.clock.runFor(16);
  }
  const before=await page.evaluate(()=>({s:window.__readingProbe!.suspends,w:window.__readingProbe!.waits})),start=clock.now();
  await page.evaluate(async()=>{const p=window.__fataTest!.player()!,v=p.getSnapshot(),w=v.core?.run.wait;if(w?.kind==='text')await p.input('advance',w.prompt,v.epoch);});
  const advanceMs=clock.now()-start,after=await page.evaluate(()=>{const v=window.__fataTest!.player()!.getSnapshot(),probe=window.__readingProbe!;return {suspends:probe.suspends,waits:probe.waits,resident:v.loading.residentBytes,music:probe.media.some(m=>!m.paused&&m.currentTime>0)};});
  if(measured)rows.push({id:boundary.id,advanceMs,suspends:after.suspends-before.s,waits:after.waits-before.w,resident:after.resident,music:after.music});
 }
 expect(rows.length).toBeGreaterThan(65);expect(await page.evaluate(()=>window.__fataTest!.player()!.getSnapshot().error)).toBeNull();expect(Math.max(...rows.map(r=>r.resident))).toBeLessThanOrEqual(67108864);
 expect(rows.reduce((n,r)=>n+r.suspends,0)).toBe(0);
 const delays=rows.map(r=>r.advanceMs).sort((a,b)=>a-b),result={mode,pages,coldStartMs,latency:180,bytesPerSecond:750000,readingMs,advances:rows.length,medianMs:delays[Math.floor(delays.length/2)],p95Ms:delays[Math.floor(delays.length*.95)],maxMs:delays.at(-1),resourcePauses:rows.reduce((n,r)=>n+r.suspends,0),mediaWaits:rows.reduce((n,r)=>n+r.waits,0),rows};
 await test.info().attach('real-reading-network',{body:JSON.stringify(result,null,2),contentType:'application/json'});
 // The controlled SDK regression asserts zero pauses for prepared advances. This full source
 // route also contains intentional transitions and fresh choice branches; report their real cost.
 await cdp.detach();
});
