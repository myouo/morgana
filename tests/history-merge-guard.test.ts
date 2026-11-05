import {test} from 'node:test';
import assert from 'node:assert/strict';
import {ProgramBuilder,instruction,richPage,richText,historyText} from 'galbox-sdk/port-kit';
import type {Instruction} from 'galbox-sdk/protocol';
import {mergeHistoryInstructions} from '../tooling/merge-history-instructions.js';
function make(code:Instruction[]){const b=new ProgramBuilder({gameId:'merge-history',release:'v1',entry:'main'}).function({id:'main',entry:code[0]!.at,layout:1,params:[],locals:[],returns:'void',code}).function({id:'helper',entry:'h-return',layout:1,params:[],locals:[],returns:'void',code:[instruction('control.return',{at:'h-return'})]});const p=b.build();return {functions:p.functions,header:b.parts().header};}
const collect=instruction('state.collect',{at:'collect',retainTasks:[],historyLimit:64}),body=richPage('body','body','v1','',[richText.text('Unchanged body')]),call=instruction('control.call',{at:'call',function:'helper',args:[]}),end=instruction('control.end',{at:'end'}),note=historyText('note','note','v1',[richText.text('Only history')]);
test('history merge preserves existing instructions and collection limits, and rejects changed bodies/call successors',()=>{
 const old=make([collect,body,call,end]),next=make([{...collect,historyLimit:128},body,note,call,end]),r=mergeHistoryInstructions(old.functions,next.functions,old.header,next.header);assert.equal(r.added,1);assert.deepEqual(r.functions[0]!.code.filter(i=>i.at!=='note'),old.functions[0]!.code);
 const bad=make([collect,richPage('body','body','v1','',[richText.text('Changed body')]),note,call,end]);assert.throws(()=>mergeHistoryInstructions(old.functions,bad.functions,old.header,bad.header),/HISTORY_MERGE_CHANGED/);
 const shifted=make([collect,body,call,note,end]);assert.throws(()=>mergeHistoryInstructions(old.functions,shifted.functions,old.header,shifted.header),/HISTORY_MERGE_CALL_ABI/);
 const leading=make([note,collect,body,call,end]);assert.equal(mergeHistoryInstructions(old.functions,leading.functions,old.header,leading.header).functions[0]!.entry,'note');
});
