import {test} from 'node:test';
import assert from 'node:assert/strict';
import {po} from 'gettext-parser';
import {extractChapter,mergeCatalog,inspectCatalog,checkControls,controlIds} from '../tooling/ks-po.js';
import type {CatalogMessage} from '../tooling/ks-po.js';
import {hash} from '../tooling/locale.js';
const spec={id:'door1',file:'fixture.ks',start:'begin',end:'end'};
const source=`*begin|Door\n[macro name=unused]\nThis is a template[p]\n[endmacro]\n[iscript]\nconst dialogue = 'not a line of story';\n[endscript]\n[image storage="garden"]\n[if exp="f.flag"]Hello [w]world[else]Goodbye[endif][p]\n*stable-a|\n[cm]\n[c text="A centered line"][p]\n*stable-b|\n[cm]\n*end|\nExcluded[p]\n*outside|`;
function messages():CatalogMessage[]{return extractChapter(source,spec).pages.map(p=>({context:p.context,id:p.text,text:p.text,sourceHash:p.sourceHash,controls:controlIds(p.text)}));}
test('chapter extraction preserves stable identity, literal text and locale-specific controls without evaluating scripts',()=>{
 const x=extractChapter(source,spec);assert.equal(x.paragraphCount,2);assert.deepEqual(x.pages.map(p=>p.context),['fixture:stable-a','fixture:stable-b']);assert.ok(x.pages[0]!.text.includes('Hello'));assert.ok(x.pages[0]!.text.includes('Goodbye'));assert.ok(!x.pages.some(p=>p.text.includes('template')||p.text.includes('not a line')||p.text.includes('Excluded')));assert.equal(x.resources[0]!.name,'garden');assert.ok(x.obligations.some(o=>o.kind==='embedded-script'));assert.ok(!x.pages.map(p=>p.text).join('').includes('f.flag'));
 const shifted=extractChapter('; comment\n\n'+source,spec);assert.deepEqual(shifted.pages.map(p=>[p.context,p.sourceHash]),x.pages.map(p=>[p.context,p.sourceHash]));
});
test('unknown inline tags and dynamic text remain explicit obligations and protected tokens',()=>{
 const x=extractChapter('*begin|\nHello[plugin effect="&f.name"][emb exp="f.text"][p]\n*id|\n*end|',spec);assert.equal(x.tags.plugin,1);assert.ok(x.obligations.some(o=>o.kind==='dynamic-text'));assert.ok(x.obligations.some(o=>o.kind==='dynamic-argument'));assert.equal(x.pages[0]!.controls[0]!.tag.name,'plugin');
 assert.deepEqual(extractChapter(source.replace('*stable-b|','*stable-a|'),spec).pages.map(p=>p.context),['fixture:stable-a','fixture:stable-a:2']);assert.throws(()=>extractChapter(source.replace('*begin|Door','*wrong|Door'),spec),/ENTRY/);
 assert.equal(extractChapter('*begin|\nMissing[p]\nNext[p]\n*id|\n*end|',spec).obligations.filter(o=>o.kind==='unlabelled-page').length,1);
});
test('PO reruns are byte stable; contributor corrections survive; changed source requires review; deletions remain obsolete',()=>{
 const m=messages(),first=mergeCatalog('zh-Hans',m);assert.equal(mergeCatalog('zh-Hans',m,first.po).po,first.po);assert.deepEqual(inspectCatalog(first.po,'zh-Hans'),{entries:2,fuzzy:0,obsolete:0});
 const parsed=po.parse(first.po);parsed.translations[m[0]!.context]![m[0]!.id]!.msgstr=[m[0]!.text.replace('Hello','Corrected')];const edited=po.compile(parsed).toString();const preserved=mergeCatalog('zh-Hans',m,edited);assert.equal(preserved.preserved,1);assert.ok(preserved.po.includes('Corrected'));assert.equal(preserved.fuzzy,0);
 const changed=m.map((item,i)=>i?item:{...item,text:item.text.replace('Hello','Native changed'),sourceHash:hash('new native')});const review=mergeCatalog('zh-Hans',changed,preserved.po);assert.equal(review.fuzzy,1);assert.ok(review.po.includes('Corrected'));assert.equal(mergeCatalog('zh-Hans',m.slice(0,1),edited).obsolete,1);
 assert.throws(()=>mergeCatalog('fr',m,edited),/LANGUAGE/);
});
test('protected control reordering, duplication and malformed markers are rejected',()=>{
 assert.doesNotThrow(()=>checkControls('a⟪k:0⟫b⟪k:1⟫',[0,1]));for(const text of ['⟪k:1⟫⟪k:0⟫','⟪k:0⟫⟪k:0⟫','⟪k:0⟫','⟪k:bad⟫'])assert.throws(()=>checkControls(text,[0,1]),/CONTROL/);
 const m=messages(),first=mergeCatalog('en',m),parsed=po.parse(first.po);parsed.translations[m[0]!.context]![m[0]!.id]!.msgstr=['Damaged'];assert.equal(mergeCatalog('en',m,po.compile(parsed).toString()).fuzzy,1);
});
