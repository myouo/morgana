import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {decodeWire} from 'galbox-sdk/wire';import {bindProgramText} from 'galbox-sdk/port-kit';import {createCore,validateRestore} from 'galbox-sdk/core';import {parseProgram,isTextComplete,isTextConfirming} from 'galbox-sdk/protocol';
import {knownSaveMapper} from '../src/migrate-saves.js';import type {LegacyEdition} from '../src/migrate-saves.js';
async function program(root:string,l:string){return bindProgramText(decodeWire('Program',new Uint8Array(await readFile(`${root}/programs/${l}.pb`))),decodeWire('ProgramTextCatalog',new Uint8Array(await readFile(`${root}/text/${l}.story.pb`))));}
for(const [edition,root]of [['opening32','private/compat32'],['prologue93','private/compat93']] as const)for(const locale of ['en','zh','jp','fr','it','ko','pt-br','ru'])test(`real ${edition}/${locale} text, choice and end cuts migrate without deleting history`,async()=>{
 const source=await program(root,locale),target=await program('generated/site',locale),core=createCore(source),migrate=knownSaveMapper(edition);let n=0,last='',id=0;const tested=[];
 for(let turn=0;turn<3000;turn++){while(core.run(100)==='yield'){}core.drainEffects();const s=core.view().run,w=s.wait;
  if(s.status==='ended'||w?.kind==='choice'&&w.at!=='title:wait'||w?.kind==='text'&&s.text?.textId!==last&&[0,7,22,30,31,44,75,92].includes(n)){
   if(w?.kind==='text')core.accept({type:'tick',ms:70});const old=core.capture(),result=await migrate({source,target,snapshot:old,profile:core.view().profile,cancellation:{cancelled:false}});validateRestore(target,result.snapshot);assert.deepEqual(result.snapshot.history.map(t=>t.content),old.history.map(t=>t.content));if(w?.kind==='text'){assert.equal(result.snapshot.text?.textId,old.text?.textId);assert.equal(result.snapshot.text?.revealed,old.text?.revealed);assert.equal(result.snapshot.text?.rich?.pauseRemainingMs,old.text?.rich?.pauseRemainingMs);}tested.push(cut(s));assert.equal(old.release,source.release);
  }
  if(s.status==='ended')break;
  if(w?.kind==='choice'){core.accept({type:'choose',prompt:w.prompt,inputId:String(++id),option:w.at==='title:wait'?'start':'greeting-1'});continue;}
  if(w?.kind==='text'){if(s.text!.textId!==last){last=s.text!.textId;n++;}core.accept({type:isTextConfirming(s.text!)||isTextComplete(s.text!)?'advance':'reveal',prompt:w.prompt,inputId:String(++id)});continue;}
  if(w?.kind==='group'||w?.kind==='delay'){const ids=w.kind==='delay'?[w.task]:s.groups.find(g=>g.id===w.group)!.members;core.accept({type:'tick',ms:Math.max(0,...ids.map(id=>s.tasks.find(t=>t.id===id)!).map(t=>t.duration-t.elapsed))});continue;}
  throw new Error('unknown source boundary');
 }
 assert.ok(tested.length>=6);assert.equal(core.view().run.status,'ended');
});
function cut(s:{status:string;wait:{kind:string;at?:string}|null}){return s.status==='ended'?'ended':s.wait?.at;}
test('legacy32 active awakening fade preserves the same visible progression and source gain after migration',async()=>{
 const source=await program('private/compat32','en'),target=await program('generated/site','en'),c=createCore(source);let id=0,found=false;
 for(let turn=0;turn<300;turn++){c.run(100);const s=c.view().run,w=s.wait;if(w?.kind==='group'&&w.at.startsWith('awakening')){c.accept({type:'tick',ms:400});const before=c.capture(),r=await knownSaveMapper('opening32')({source,target,snapshot:before,profile:c.view().profile,cancellation:{cancelled:false}});validateRestore(target,r.snapshot);assert.equal(r.snapshot.wait?.at,before.wait?.at);assert.equal(r.snapshot.stage[0]?.layers?.[0]?.weight,before.stage[0]?.layers?.[0]?.weight);found=true;break;}
  if(w?.kind==='choice')c.accept({type:'choose',prompt:w.prompt,option:'start',inputId:String(++id)});else if(w?.kind==='text')c.accept({type:isTextComplete(s.text!)||isTextConfirming(s.text!)?'advance':'reveal',prompt:w.prompt,inputId:String(++id)});else if(w?.kind==='group'||w?.kind==='delay'){const ids=w.kind==='delay'?[w.task]:s.groups.find(g=>g.id===w.group)!.members;c.accept({type:'tick',ms:Math.max(...ids.map(id=>s.tasks.find(t=>t.id===id)!).map(t=>t.duration-t.elapsed))});}else throw new Error('wait');}
 assert.equal(found,true);
});
