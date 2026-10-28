import {presentation} from './helpers.js';
import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {ProgramBuilder,richText as R,richPage,instruction,splitProgramText} from 'galbox-sdk/port-kit';
import {createReleaseManifest} from 'galbox-sdk/release';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
import {compilePO,parsePO} from '../../tooling/po.js';
import {encodePOText,decodePOText} from '../../tooling/po-text.js';
test('editable styled PO reaches actual DOM ruby, preserves timed pause on restore and gates inline confirmation',async({page})=>{
 const source=[R.text('A',{italic:true}),R.pause(500),R.ruby('灯','とう'),R.confirm(),R.text('B')],encoded=encodePOText(source),po=compilePO('en',[{context:'page:letter',id:encoded,text:encoded.replace('灯','光').replace('とう','ひかり')}]),translation=parsePO(po,'en').get('page:letter');if(!translation)throw new Error('translation');const runs=decodePOText(translation.text,source).runs;
 const program=new ProgramBuilder({gameId:'po-browser-fixture',release:'v1',entry:'main'}).function({id:'main',entry:'page',layout:1,params:[],locals:[],returns:'void',code:[richPage('page','letter','v1','',runs),instruction('control.end',{at:'end'})]}).build(),release=await createReleaseManifest({program,series:'po-v1',resources:[]},{async sha256(text){return createHash('sha256').update(text).digest('hex');}}),{template,catalog}=splitProgramText(program,'en');
 for(const [path,bytes]of [['/programs/en.pb',encodeWire('Program',template)],['/programs/en.release.pb',encodeWire('ReleaseManifest',release)],['/text/en.story.pb',encodeWire('ProgramTextCatalog',catalog)]] as const)await page.route('**'+path,route=>route.fulfill({contentType:'application/octet-stream',body:Buffer.from(bytes)}));
 // The synthetic text program has no source choices or authored autosave point. Keep its metadata consistent.
 const artwork=decodeWire('JsonValue',new Uint8Array(await readFile('generated/site/programs/en.title.pb')));if(!artwork||typeof artwork!=='object'||Array.isArray(artwork))throw new Error('artwork');await page.route('**/programs/en.title.pb',route=>route.fulfill({contentType:'application/octet-stream',body:Buffer.from(encodeWire('JsonValue',{...artwork,choices:[],autoAt:[]}))}));
 const time=new Date('2026-10-28T00:00:00Z');await page.clock.install({time});await page.clock.pauseAt(new Date(time.getTime()+1000));await page.goto('/?lang=en&__test');await expect.poll(()=>page.evaluate(()=>window.__fataTest?.player()?.getSnapshot().core?.run.wait?.kind)).toBe('text');await page.clock.runFor(100);
 const paused=await page.evaluate(async()=>{const player=window.__fataTest?.player();if(!player)throw new Error('player');const before=player.capture().text?.rich?.pauseRemainingMs;await player.quickSave();await player.quickLoad();return {before,after:player.capture().text?.rich?.pauseRemainingMs};});expect(paused.before).toBeGreaterThan(0);expect(paused.after).toBe(paused.before);
 await page.clock.runFor(600);await expect(page.locator('.galbox-text rt')).toHaveText('ひかり');expect(await page.locator('.galbox-text').evaluate(e=>getComputedStyle(e.querySelector('span')??e).fontStyle)).toBe('italic');expect(await page.evaluate(()=>window.__fataTest?.player()?.capture().text?.rich?.waitingForClick)).toBe(true);
 await page.locator('.advance-surface').click();await page.clock.runFor(40);expect(await page.evaluate(()=>window.__fataTest?.player()?.capture().text?.content)).toBe('A光B');expect(await page.evaluate(()=>window.__fataTest?.player()?.capture().text?.rich?.waitingForClick??false)).toBe(false);await page.locator('.advance-surface').click();await expect.poll(()=>page.evaluate(()=>window.__fataTest?.player()?.getSnapshot().core?.run.status)).toBe('ended');
});
