import {test} from 'node:test';import assert from 'node:assert/strict';import {encodeWire,decodeWire} from 'galbox-sdk/wire';import {parseJsonValue} from 'galbox-sdk/protocol';import {historySpeakerHints} from '../src/history-speaker-hints.js';import {titleData} from '../src/artwork.js';
const hint={at:'fourth:known',key:'keeper',text:'  Keeper',before:1,after:1,style:{fontSize:16,baseSize:18,color:'#ffffff',italic:false,bold:false}};
test('source name hints survive actual native-value protobuf transport and old catalogs default to empty',()=>{
 const decoded=decodeWire('JsonValue',encodeWire('JsonValue',parseJsonValue([hint]))),map=historySpeakerHints(decoded);assert.equal(map.get(hint.at)?.style.scale,16/18);assert.equal(map.get(hint.at)?.text,hint.text);assert.equal(historySpeakerHints(undefined).size,0);assert.equal(historySpeakerHints([]).size,0);
});
test('bad paths, duplicate source addresses, unbounded breaks and invalid source styles reject',()=>{
 for(const value of [[hint,hint],[{...hint,at:'../private'}],[{...hint,before:5}],[{...hint,after:1.5}],[{...hint,text:''}],[{...hint,style:{fontSize:16,baseSize:18,color:'url(unknown)'}}]])assert.throws(()=>historySpeakerHints(value));
});
test('note-name metadata has a separate bounded capacity while legacy reset catalogs retain their old limit',()=>{
 const rows=Array.from({length:128},(_,i)=>({...hint,at:'fourth:note'+i})),decoded=decodeWire('JsonValue',encodeWire('JsonValue',parseJsonValue(rows)));assert.throws(()=>historySpeakerHints(rows.slice(0,33)),/HISTORY_SPEAKER_HINTS/);assert.equal(historySpeakerHints(decoded,128).size,128);assert.throws(()=>historySpeakerHints([...rows,{...hint,at:'fourth:overflow'}],128),/HISTORY_SPEAKER_HINTS/);assert.throws(()=>historySpeakerHints([...rows.slice(0,32),rows[0]],128),/HISTORY_SPEAKER_HINT/);
});

test('note names cannot overlap an existing reset or authored leading break',()=>{
 assert.throws(()=>titleData({historyNoteNames:[hint],historyLeading:[{at:hint.at,lines:1}]}),/HISTORY_NOTE_NAME_OVERLAP/);assert.throws(()=>titleData({historyNoteNames:[hint],historyResets:[hint]}),/HISTORY_NOTE_NAME_OVERLAP/);
});
