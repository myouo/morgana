import {expect} from '@playwright/test';
import type {Page} from '@playwright/test';
export async function presentation(page:Page,goal:'title'|'text'|'ended',at?:string){
 // Speculative lookahead can remain active while a committed scene animates.
 // Wait for durable activation before driving the presentation clock. A candidate
 // can publish its Core while still preparing and paused by the activation barrier.
 for(let i=0;i<100;i++){
  try{await expect.poll(async()=>{await page.clock.runFor(16);return page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot();if(v?.error)throw new Error(v.error);return v?.lifecycle==='playing'&&!!v.core&&v.loading.phase==='idle';});},{timeout:15000,intervals:[50]}).toBe(true);}catch(error){console.error('Presentation readiness',await page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot();return {lifecycle:v?.lifecycle,loading:v?.loading,error:v?.error,wait:v?.core?.run.wait,paused:v?.paused};}));throw error;}
  const cut=await page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot();if(!v?.core)throw new Error('Player not ready');if(v.error)throw new Error(v.error);const r=v.core.run,w=r.wait;let remaining=0;if(w?.kind==='group'){const g=r.groups.find(g=>g.id===w.group);remaining=Math.max(0,...(g?.members??[]).map(id=>r.tasks.find(t=>t.id===id)).filter(t=>t?.status==='running').map(t=>t!.duration-t!.elapsed));}if(w?.kind==='delay'){const t=r.tasks.find(t=>t.id===w.task);if(t)remaining=t.duration-t.elapsed;}return {status:r.status,wait:w,remaining};});
  if(at&&cut.wait?.at===at)return;
  if(goal==='title'&&cut.wait?.at==='title:wait'||goal==='text'&&cut.wait?.kind==='text'||goal==='ended'&&cut.status==='ended')return;
  if(!cut.wait||!['group','delay'].includes(cut.wait.kind))throw new Error('Unexpected presentation wait '+JSON.stringify(cut));
  await mediaStarted(page);
  await page.clock.fastForward(Math.max(16,cut.remaining+32));
 }
 throw new Error('Presentation did not settle');
}

// Network media runs on real time. Do not jump the fake watchdog clock by an entire
// animation while a real HEAD/play handshake is still pending. No fake receipt is sent.
export async function mediaStarted(page:Page){try{await expect.poll(async()=>{await page.clock.runFor(16);return page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot();if(v?.error)throw new Error(v.error);return !v?.core?.run.tasks.some(t=>t.mediaTask?.phase==='pending'||t.videoTask?.phase==='pending'||t.kind==='audio'&&t.status==='running');});},{timeout:15000,intervals:[50]}).toBe(true);}catch(error){console.error('Media readiness',await page.evaluate(()=>{const v=window.__fataTest?.player()?.getSnapshot();return {loading:v?.loading,media:v?.media,error:v?.error,wait:v?.core?.run.wait?.at,tasks:v?.core?.run.tasks.filter(t=>['media','audio','video'].includes(t.kind)).map(t=>({id:t.id,kind:t.kind,status:t.status,phase:t.mediaTask?.phase??t.videoTask?.phase,asset:t.asset}))};}));throw error;}}
