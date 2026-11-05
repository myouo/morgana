import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCore} from 'galbox-sdk/core';
import {ProgramBuilder,instruction,branchExpression,expr,variable} from 'galbox-sdk/port-kit';
import {bool} from 'galbox-sdk/protocol';
import {endingTitleReturn} from '../tooling/ending-title-return.js';
test('a bad ending loaded inside its final body sets the title destination without changing the saved call return ABI',()=>{
 const b=new ProgramBuilder({gameId:'ending-title',release:'v1',entry:'main'});b.global({id:'original.return-title',kind:'bool',initial:bool(false)});
 const page=(at:string)=>instruction('text.page',{at,textId:at,revision:'v1',speaker:'',content:at});
 b.function({id:'main',entry:'call-ending',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.call',{at:'call-ending',function:'ending',args:[]}),branchExpression('destination',expr.variable(variable('original.return-title','bool')),'title','fifth'),page('fifth'),instruction('control.end',{at:'wrong-end'}),page('title'),instruction('control.end',{at:'end'})]});
 b.function({id:'ending',entry:'call-body',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.call',{at:'call-body',function:'body',args:[]}),instruction('control.return',{at:'ending-return'})]});b.function({id:'body',entry:'bad-ending',layout:1,params:[],locals:[],returns:'void',code:[page('bad-ending'),instruction('control.return',{at:'body-return'})]});
 const original=b.build(),old=createCore(original);old.run(100);const cut=old.capture(),target=structuredClone(original),ending=target.functions.find(f=>f.id==='ending')!;endingTitleReturn(ending.code);assert.equal(ending.code[1]!.at,'ending-return');const restored=createCore(target,old.view().profile,cut);assert.deepEqual(restored.capture().frames,cut.frames);let wait=restored.capture().wait;assert.equal(wait?.kind,'text');if(wait?.kind!=='text')throw new Error('text');restored.accept({type:'reveal',prompt:wait.prompt,inputId:'reveal'});restored.run(100);wait=restored.capture().wait;if(wait?.kind!=='text')throw new Error('text');restored.accept({type:'advance',prompt:wait.prompt,inputId:'advance'});restored.run(100);assert.equal(restored.capture().text?.textId,'title');assert.equal(restored.capture().globals['original.return-title']?.value,true);
});
