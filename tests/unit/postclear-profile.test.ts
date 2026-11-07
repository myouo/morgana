import {test} from 'node:test';
import assert from 'node:assert/strict';
import {fataendProfile,freshProfile} from "../../tooling/prologue.js";
import {tokenize} from "../../tooling/kag.js";
test('both source profiles choose their authored text through nested if/else without evaluating code',()=>{
 const tokens=tokenize('[if exp="sf.fataend==1"]clear[if exp="sf.fataend!=1"]wrong[else] soul[endif][else]fresh[endif]','profile.ks');
 const text=(cleared:boolean)=>fataendProfile(tokens,cleared).flatMap(t=>t.kind==='text'?[t.text]:[]).join('');assert.equal(text(true),'clear soul');assert.equal(text(false),'fresh');assert.deepEqual(freshProfile(tokens),fataendProfile(tokens,false));
 assert.throws(()=>fataendProfile(tokenize('[if exp="sf.fataend=1"]bad[endif]','profile.ks'),true),/PROLOGUE_CONDITION/);
});
