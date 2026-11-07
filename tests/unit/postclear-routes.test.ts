import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ProgramBuilder,instruction,sceneExtra,sceneMarker,extrasCatalog} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {bool} from 'galbox-sdk/protocol';
import type {Function as ProgramFunction} from 'galbox-sdk/protocol';
import {postclearRoutes,postclearInterlude} from "../../tooling/postclear-routes.js";

for(const marker of [false,true])test(marker?'cleared guards preserve the required extras scene marker at entry':'cleared callee guards preserve old call/return ABI even for adjacent chapter calls',()=>{
 const b=new ProgramBuilder({gameId:'route-proof',release:'v1',entry:'main'});b.global({id:postclearInterlude,kind:'bool',initial:bool(false)});
 const fn=(id:string,content:string):ProgramFunction=>({id,entry:id+':text',layout:1,params:[],locals:[],returns:'void',code:[instruction('text.page',{at:id+':text',textId:id,revision:'v1',speaker:'',content}),instruction('control.return',{at:id+':return'})]});
 b.function({id:'main',entry:'main:door1',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.call',{at:'main:door1',function:'ordinary',args:[]}),instruction('control.call',{at:'call:interlude1-body-0',function:'interlude1-body-0',args:[]}),instruction('control.call',{at:'call:interlude1-body-1',function:'interlude1-body-1',args:[]}),instruction('control.call',{at:'integration:chapter2',function:'second',args:[]}),instruction('control.end',{at:'end'})]});
 const scene=sceneExtra('ordinary-scene','ordinary',{title:'Ordinary'});if(marker)b.extras(extrasCatalog('route-scenes','v1',[scene]));
 for(const f of [fn('ordinary','ordinary'),fn('interlude1-body-0','interlude 0'),fn('interlude1-body-1','interlude 1'),fn('second','second'),fn('clear-first','cleared first with interlude'),fn('clear-second','cleared second')]){if(marker&&f.id==='ordinary'){f.entry='ordinary:marker';f.code.unshift(sceneMarker(f.entry,scene));}b.function(f);}
 const before=b.build(),old=createCore(before);old.run(100);const saved=old.capture(),after=structuredClone(before),instructions=new Map(after.functions.flatMap(f=>f.code.map(i=>[i.at,structuredClone(i)]as const))),nextCalls=after.functions.flatMap(f=>f.code.flatMap((i,n)=>i.op==='control.call'?[[i.at,f.code[n+1]?.at]as const]:[]));
 after.capabilities.push('expressions');
 postclearRoutes(after.functions,[{at:'main:door1',target:'clear-first',withInterlude:true},{at:'integration:chapter2',target:'clear-second'}]);
 for(const f of after.functions)for(const i of f.code)if(instructions.has(i.at))assert.deepEqual(i,instructions.get(i.at));
 for(const [at,next]of nextCalls){const f=after.functions.find(f=>f.code.some(i=>i.at===at))!;assert.equal(f.code[f.code.findIndex(i=>i.at===at)+1]?.at,next);}
 if(!marker){const restored=createCore(after,old.view().profile,saved);assert.deepEqual(restored.capture().frames,saved.frames);}else assert.equal(after.functions.find(f=>f.id==='ordinary')!.entry,'ordinary:marker');
 const texts=(cleared:boolean)=>{const c=createCore(after,{revision:0,read:[],values:{'original.fataend':bool(cleared)}}),seen:string[]=[];for(let n=0;n<30;n++){c.run(100);const s=c.capture();if(s.status==='ended')return {seen,marker:s.globals[postclearInterlude]?.value};const w=s.wait;assert.equal(w?.kind,'text');if(w?.kind!=='text')throw new Error('text');if(!seen.includes(s.text!.content))seen.push(s.text!.content);c.accept({type:'reveal',prompt:w.prompt,inputId:'reveal'+n});c.run(100);const current=c.capture().wait;if(current?.kind==='text')c.accept({type:'advance',prompt:current.prompt,inputId:'advance'+n});}throw new Error('route loop');};
 assert.deepEqual(texts(false).seen,['ordinary','interlude 0','interlude 1','second']);assert.deepEqual(texts(true),{seen:['cleared first with interlude','cleared second'],marker:false});
});
