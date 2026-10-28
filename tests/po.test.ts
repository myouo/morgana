import test from 'node:test';
import assert from 'node:assert/strict';
import {compilePO,parsePO,checkSources} from '../tooling/po.js';
import {encodePOText,decodePOText} from '../tooling/po-text.js';
import {localizeOpening,pageRevision} from '../tooling/localize-opening.js';
import type {Opening} from '../tooling/opening.js';
import {richText as R,ProgramBuilder,richPage,instruction,splitProgramText,bindProgramText} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';
import {encodeWire,decodeWire} from 'galbox-sdk/wire';
test('editable PO corrections reach the actual SDK Core through validated protobuf and change the read revision',async()=>{
 const source:Opening={pages:[{id:'original-page-id',text:'原文\n后文',runs:[R.text('原文'),R.br(),R.text('后文')],source:{file:'fixture',line:1,column:1},labelLine:2}],startLine:1,endLine:2,source:'fixture',musicFadeMs:100},english=structuredClone(source);english.pages[0]!.text='Original paragraph';english.pages[0]!.runs=[R.text('Original paragraph')];const unchanged=structuredClone(source);
 const make=(text:string)=>compilePO('zh-Hans',[{context:'page:original-page-id',id:'Original paragraph',text}]);const same=await localizeOpening(source,english,'zh-Hans',make(encodePOText(source.pages[0]!.runs)));assert.deepEqual(same.opening,source);assert.equal(same.edited.size,0);
 const corrected=await localizeOpening(source,english,'zh-Hans',make('修正文{{gb:break:0}}后文')),page=corrected.opening.pages[0]!;assert.deepEqual(source,unchanged);assert.equal(page.text,'修正文\n后文');assert.notEqual(pageRevision('source-v1',page,corrected.edited),pageRevision('source-v1',page,same.edited));
 const program=new ProgramBuilder({gameId:'po-fixture',release:'corrected-v1',entry:'main'}).function({id:'main',entry:'page',layout:1,params:[],locals:[],returns:'void',code:[richPage('page',page.id,pageRevision('source-v1',page,corrected.edited),'',page.runs),instruction('control.end',{at:'end'})]}).build();const {template,catalog}=splitProgramText(program,'zh-Hans'),bound=bindProgramText(decodeWire('Program',encodeWire('Program',template)),decodeWire('ProgramTextCatalog',encodeWire('ProgramTextCatalog',catalog))),core=createCore(bound);core.run(100);assert.equal(core.capture().text?.content,page.text);assert.deepEqual(createCore(bound,core.view().profile,decodeWire('Snapshot',encodeWire('Snapshot',core.capture()))).capture().text,core.capture().text);
 await assert.rejects(localizeOpening(source,english,'zh-Hans',make('误删了换行')),/PO_CONTROL_MARKERS/);
});
test('PO rejects duplicate context, fuzzy, untranslated, source mismatch, wrong language and invalid syntax',()=>{
 const text=compilePO('en',[{context:'ui:start',id:'Start',text:'Begin'}]);assert.equal(parsePO(text,'en').get('ui:start')?.text,'Begin');assert.throws(()=>parsePO(text,'ja'),/PO_LANGUAGE/);assert.throws(()=>parsePO(text.replace('msgctxt "ui:start"','#, fuzzy\nmsgctxt "ui:start"'),'en'),/PO_FUZZY/);assert.throws(()=>parsePO(text.replace('msgstr "Begin"','msgstr ""'),'en'),/PO_TRANSLATION/);assert.throws(()=>parsePO(text+'\nmsgctxt "ui:start"\nmsgid "Start"\nmsgstr "Again"\n','en'));assert.throws(()=>parsePO(text+'\nmsgid "unterminated','en'));assert.throws(()=>checkSources(parsePO(text,'en'),new Map([['ui:start','Changed source']])),/PO_SOURCE_CHANGED/);
});
test('literal PO text preserves explicit newline and click controls and rejects missing, reordered or invented markers',()=>{
 const source=[R.text('A'),R.br(),R.text('B'),R.confirm(),R.text('C')],encoded=encodePOText(source);assert.deepEqual(decodePOText(encoded,source).runs,source);assert.deepEqual(decodePOText('文{{gb:break:0}}本{{gb:confirm:1}}末',source).runs.map(r=>r.kind),['text','break','text','confirm','text']);for(const text of ['ABC','A{{gb:confirm:1}}B{{gb:break:0}}C',encoded+'{{gb:eval:2}}',encoded+'{{gb:break:0}}'])assert.throws(()=>decodePOText(text,source),/PO_CONTROL_MARKERS/);
});
test('PO translations preserve source styles, timing and ruby while translating visible text and reading',()=>{
 const source=[R.text('A',{italic:true,color:'#707070'}),R.pause(500),R.speed(12),R.ruby('灯','とう',{bold:true}),R.confirm(),R.text('B')],before=structuredClone(source),encoded=encodePOText(source);
 assert.deepEqual(decodePOText(encoded,source).runs,source);const changed=encoded.replace('A','甲').replace('灯','光').replace('とう','ひかり'),translated=decodePOText(changed,source);
 assert.equal(translated.plain,'甲光B');assert.deepEqual(translated.runs.map(r=>r.kind),source.map(r=>r.kind));assert.deepEqual(translated.runs[1],R.pause(500));assert.deepEqual(translated.runs[2],R.speed(12));assert.deepEqual(translated.runs[3],R.ruby('光','ひかり',{bold:true}));assert.deepEqual(source,before);
 assert.throws(()=>decodePOText(encoded.replace('A',''),source),/PO_STYLE/);assert.throws(()=>decodePOText(encoded.replace('とう',''),source),/PO_RUBY/);assert.throws(()=>decodePOText(encoded.replace('{{gb:pause:2}}',''),source),/PO_CONTROL_MARKERS/);
 const first=translated.runs[0];if(first?.kind!=='text'||!first.style)throw new Error('style');first.style.italic=false;assert.deepEqual(source,before);
});
