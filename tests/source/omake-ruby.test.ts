import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readDoorIR} from "../../tooling/door-ir.js";
import {readDoorText} from "../../tooling/door-text.js";
import {chapters} from "../../tooling/chapter-catalog.js";
import {searchCondition,searchExpression,omakeFlags} from "../../tooling/search-conditions.js";
import {ProgramBuilder,branchExpression,instruction} from 'galbox-sdk/port-kit';
import {bool} from 'galbox-sdk/protocol';
import {createCore} from 'galbox-sdk/core';

test('original backstage ruby/ch groups retain five complete base strings and literal readings',async()=>{
 const source=await readFile('private/text/zh/scenario/omake.ks','utf8'),macro=await readFile('private/text/zh/scenario/macro.ks','utf8'),ir=await readDoorIR(source,'zh-Hans',{chapter:chapters.find(c=>c.id==='omake')!,catalogRoot:'locales'}),parse=(input:typeof ir)=>readDoorText(input,macro,22,{namespace:'omake',extended:true,historyPolicy:true});
 const pairs=new Set(parse(ir).nodes.flatMap(n=>n.kind==='text'?n.atoms.flatMap(a=>a.kind==='text'&&a.reading?[JSON.stringify([a.text,a.reading])]:[]):[]));assert.deepEqual(pairs,new Set([['「我」','watashi'],['『你』','kimi'],['“我”','boku']].map(v=>JSON.stringify(v))));
 const tags=ir.tokens.filter(t=>t.kind==='tag'&&t.name==='ruby');assert.equal(tags.length,5);
 const dynamic={...ir,tokens:ir.tokens.map(t=>t===tags[0]&&t.kind==='tag'?{...t,attributes:t.attributes.map(a=>({...a,mode:'expression' as const}))}:t)};assert.throws(()=>parse(dynamic),/UNSUPPORTED_DYNAMIC_ARGUMENT/);
 const orphan={...ir,tokens:ir.tokens.filter((t,n)=>t.kind!=='tag'||t.name!=='ch'||ir.tokens[n-1]!==tags[0])};assert.throws(()=>parse(orphan),/DOOR_RUBY_NEXT_CH/);
});

test('backstage predicates accept exactly the declared nine flags and retain the all-visited condition',()=>{
 assert.equal(omakeFlags.length,9);for(const key of omakeFlags)assert.doesNotThrow(()=>searchExpression(searchCondition('f.'+key+'==false')));
 for(let mask=0;mask<8;mask++){const b=new ProgramBuilder({gameId:'omake-predicate',release:'v1',entry:'main'});for(let n=0;n<3;n++)b.global({id:'original.omake2'+(n+1),kind:'bool',initial:bool(!!(mask&(1<<n)))});b.function({id:'main',entry:'test',layout:1,params:[],locals:[],returns:'void',code:[branchExpression('test',searchExpression(searchCondition('f.omake21==true&&f.omake22==true&&f.omake23==true')),'done','again'),instruction('text.page',{at:'done',textId:'done',revision:'v1',speaker:'',content:'done'}),instruction('control.end',{at:'end'}),instruction('text.page',{at:'again',textId:'again',revision:'v1',speaker:'',content:'again'}),instruction('control.end',{at:'end2'})]});const c=createCore(b.build());c.run(100);assert.equal(c.capture().wait?.at,mask===7?'done':'again');}
 assert.throws(()=>searchCondition('f.omake24==true'),/SEARCH_FLAG_CONDITION/);assert.throws(()=>searchCondition('f.omake1=getFlag()'),/SEARCH_CONDITION/);
});

test('localized literal-false backstage blocks remain translated but produce no active source pages',async()=>{
 const {specializeOmake}=await import("../../tooling/omake-constants.js"),raw=await readFile('private/text/en/scenario/omake.ks','utf8'),ir=await readDoorIR(raw,'en',{chapter:chapters.find(c=>c.id==='omake')!,catalogRoot:'locales'}),before=ir.extraction.pages.length,result=specializeOmake(ir),ranges=[...raw.matchAll(/\[if exp="false"\]([\s\S]*?)\[endif\]/gu)].map(m=>({a:raw.slice(0,m.index).split('\n').length,z:raw.slice(0,m.index+m[0].length).split('\n').length}));assert.equal(ranges.length,4);assert.equal(result.sourceIssues.length,4);assert.equal(ir.extraction.pages.length,before);assert.equal(result.ir.extraction.pages.length,ir.extraction.pages.filter(p=>!ranges.some(r=>p.source.line>=r.a&&p.source.line<=r.z)).length);assert.ok(result.ir.extraction.pages.length<before);assert.deepEqual(result.ir.tokens.filter(t=>t.kind==='tag'&&t.name==='if').map(t=>t.source.line),ir.tokens.filter(t=>t.kind==='tag'&&t.name==='if'&&t.args.exp!=='false'&&!ranges.some(r=>t.source.line>=r.a&&t.source.line<=r.z)).map(t=>t.source.line));
});

test('known source library reloads are validated as data and reject added initialization code',async()=>{
 const {validateMacroLibraryReload}=await import("../../tooling/source-macros.js");for(const l of ['jp','ko']){const macro=await readFile(`private/text/${l}/scenario/macro.ks`,'utf8');assert.doesNotThrow(()=>validateMacroLibraryReload(macro));assert.throws(()=>validateMacroLibraryReload(macro+'\n[eval exp="arbitrary()"]'),/SOURCE_LIBRARY_TOPLEVEL/);assert.throws(()=>validateMacroLibraryReload(macro+'\nunexpected text'),/SOURCE_LIBRARY_TOPLEVEL/);}
});
