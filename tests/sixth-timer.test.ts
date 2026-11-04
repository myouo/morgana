import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {sixthStructure} from '../tooling/lower-sixth.js';
import {readDoorIR} from '../tooling/door-ir.js';
import {chapters} from '../tooling/chapter-catalog.js';
import {languages} from '../tooling/locale.js';
import {localeInfo} from '../src/locales.js';
import {ProgramBuilder,instruction,interactionPrompt,variable,compileProgramModuleParts,createModuleProgram} from 'galbox-sdk/port-kit';
import {string} from 'galbox-sdk/protocol';
import {createCore} from 'galbox-sdk/core';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {namespaceFragment} from '../tooling/fragment-namespace.js';
test('all eight sixth-door source timers match the finite two-second profile and altered scripts reject',async()=>{
 for(const locale of languages){const text=await readFile(`private/text/${locale}/scenario/scenario6.ks`,'utf8'),ir=await readDoorIR(text,localeInfo[locale].html,{chapter:chapters.find(c=>c.id==='scenario6')!,catalogRoot:'locales'}),plan=sixthStructure(ir);assert.equal(plan.deadlineMs,2000);assert.ok(!plan.menu.tokens.some(t=>t.kind==='script'));const changed={...ir,tokens:ir.tokens.map(t=>t.kind==='script'?{...t,text:t.text.replace('timer.interval = 1000','timer.interval = 1').replace('timer.interval=1000','timer.interval=1')}:t)};assert.throws(()=>sixthStructure(changed),/TIMER_PROFILE/);}
});
test('relocated modular timed input preserves remaining time, accepts before deadline and refuses late old input',async()=>{
 const b=new ProgramBuilder({gameId:'sixth-timer-fixture',release:'v1',entry:'main'}).global({id:'route',kind:'string',initial:string('')}),fragment=namespaceFragment([{id:'body',entry:'timed',layout:1,params:[],locals:[],returns:'void',code:[interactionPrompt('timed',variable('route','string'),'Choose',[{id:'deny',label:'Deny',target:'chosen'}],{deadlineMs:2000,timeout:{id:'silence',target:'late'}}),instruction('text.page',{at:'chosen',textId:'chosen',revision:'v1',speaker:'',content:'Before deadline.'}),instruction('control.return',{at:'chosen-end'}),instruction('text.page',{at:'late',textId:'late',revision:'v1',speaker:'',content:'The timer already elapsed.'}),instruction('control.return',{at:'late-end'})]}],'sixth/');for(const f of fragment.functions)b.function(f);b.function({id:'main',entry:'call',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.call',{at:'call',function:'sixth/body',args:[]}),instruction('control.end',{at:'end'})]});const built=await compileProgramModuleParts({parts:b.parts(),resources:[],series:'1'}),source=createModuleProgram(built.manifest);source.installAll(built.files.map(f=>f.body));const c=createCore(source);c.run(100);let w=c.capture().wait;assert.ok(w?.kind==='interaction');c.accept({type:'interaction.activate',prompt:w.prompt,attempt:w.attempt});c.accept({type:'tick',ms:750});const saved=decodeWire('Snapshot',encodeWire('Snapshot',c.capture()));for(const [ms,id]of [[1249,'chosen'],[1250,'late']]as const){const restored=createCore(source,c.view().profile,saved);w=restored.capture().wait;assert.ok(w?.kind==='interaction');assert.equal(w.elapsedMs,750);restored.accept({type:'interaction.activate',prompt:w.prompt,attempt:w.attempt});restored.accept({type:'tick',ms});restored.accept({type:'interaction.choose',prompt:w.prompt,attempt:w.attempt,option:'deny',inputId:'input-'+ms});restored.run(100);assert.equal(restored.capture().text?.textId,id);}assert.deepEqual(c.capture(),saved);
});
