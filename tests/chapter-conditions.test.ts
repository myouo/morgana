import {test} from 'node:test';import assert from 'node:assert/strict';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {ProgramBuilder,instruction,assignExpression,expr,variable} from 'galbox-sdk/port-kit';
import {createCore} from 'galbox-sdk/core';import {emptyProfile,i32} from 'galbox-sdk/protocol';
import type {Program,Profile,Instruction} from 'galbox-sdk/protocol';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {lowerChapterConditions} from '../tooling/lower-conditions.js';
import {tokenize} from '../tooling/kag.js';import type {Token,Tag} from '../tooling/kag.js';
import {freshProfile} from '../tooling/prologue.js';
import {languages} from '../tooling/locale.js';
function compile(tokens:Token[]){
 const b=new ProgramBuilder({gameId:'chapter-conditions',release:'v1',entry:'main'}),count=variable('count','i32'),sum=variable('sum','i32'),leaves=new Map<number,Token>(),steps=tokens.flatMap((t,index)=>{
  if(t.kind==='tag'&&['if','else','endif','elsif'].includes(t.name))return [{control:t,code:[]}];
  if(t.kind!=='tag'||!['image','playse','jump','button','eval','title','maid','soul'].includes(t.name))return [];
  leaves.set(index,t);const code:Instruction[]=[assignExpression(`count:${index}`,count,expr.binary('add',expr.variable(count),expr.integer(1))),assignExpression(`sum:${index}`,sum,expr.binary('add',expr.variable(sum),expr.integer(index%32749)))];return [{code}];
 });b.global({id:count.id,kind:'i32',initial:i32(0)}).global({id:sum.id,kind:'i32',initial:i32(0)});const code=lowerChapterConditions(steps,'condition','end');return {leaves,p:b.function({id:'main',entry:code[0]?.at??'end',layout:1,params:[],locals:[],returns:'void',code:[...code,instruction('control.end',{at:'end'})]}).build()};
}
function run(p:Program,profile:Profile,budget:number){const c=createCore(p,profile);while(c.run(budget)==='yield'){}return c.capture();}
function expected(tokens:Token[],leaves:Map<number,Token>,completed:boolean){const conditionTokens=tokens.map(t=>completed&&t.kind==='tag'&&t.name==='if'?{...t,args:{...t.args,exp:t.args.exp!.replace(/==|!=/u,op=>op==='=='?'!=':'==')},attributes:t.attributes.map(a=>a.name==='exp'?{...a,value:a.value.replace(/==|!=/u,op=>op==='=='?'!=':'==')}:a)}:t),selected=new Set(freshProfile(conditionTokens).map(t=>t.source.line+':'+t.source.column));return [...leaves].filter(([,t])=>selected.has(t.source.line+':'+t.source.column)).reduce((v,[index])=>({count:v.count+1,sum:v.sum+index%32749}),{count:0,sum:0});}
test('whole eight-language interlude/door2 conditions compile to standard SDK branches on fresh and completed profiles',async()=>{
 const rows=[];for(const locale of languages)for(const [file,start]of [['scenario.ks','zero3'],['scenario2.ks','start']] as const){const all=tokenize(await readFile(`private/text/${locale}/scenario/${file}`,'utf8'),file),begin=all.findIndex(t=>t.kind==='label'&&t.name===start);assert.ok(begin>=0);const tokens=all.slice(begin),{p,leaves}=compile(tokens);
  for(const completed of [false,true]){const profile=emptyProfile();if(completed)profile.values['original.fataend']=i32(1);const a=run(p,profile,1),b=run(p,profile,100);assert.deepEqual(a,b);const result=expected(tokens,leaves,completed);assert.deepEqual(a.globals,{count:i32(result.count),sum:i32(result.sum)});assert.equal(a.status,'ended');const restored=createCore(p,profile,decodeWire('Snapshot',encodeWire('Snapshot',a)));assert.deepEqual(restored.capture(),a);rows.push({locale,file,completed,conditions:p.functions[0]!.code.filter(i=>i.op==='control.branch').length,selectedActions:result.count});}}
 await mkdir('artifacts/interface-completion',{recursive:true});await writeFile('artifacts/interface-completion/chapter-conditions.json',JSON.stringify(rows,null,2)+'\n');
});
test('unsupported expressions, orphan/duplicate branches and anchor collisions fail before producing a program',()=>{
 const controls=(s:string)=>tokenize(s,'conditions.ks').filter((t):t is Tag=>t.kind==='tag').map(control=>({control,code:[]}));for(const source of ['[if exp="sf.other==1"][endif]','[if exp="sf.fataend==1 || true"][endif]','[if exp="(globalThis.x=1)"][endif]','[else]','[endif]','[if exp="sf.fataend==1"]','[if exp="sf.fataend==1"][else][else][endif]','[elsif exp="sf.fataend==1"]'])assert.throws(()=>lowerChapterConditions(controls(source),'test','end'));
 assert.throws(()=>lowerChapterConditions([{code:[instruction('control.jump',{at:'test:0',target:'end'})]}],'test','end'));
});
