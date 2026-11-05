import {test} from 'node:test';import assert from 'node:assert/strict';import {encodeWire,decodeWire} from 'galbox-sdk/wire';import {parseJsonValue} from 'galbox-sdk/protocol';import {historySpeakerHints} from '../src/history-speaker-hints.js';
const hint={at:'fourth:known',key:'keeper',text:'  Keeper',before:1,after:1,style:{fontSize:16,baseSize:18,color:'#ffffff',italic:false,bold:false}};
test('source name hints survive actual native-value protobuf transport and old catalogs default to empty',()=>{
 const decoded=decodeWire('JsonValue',encodeWire('JsonValue',parseJsonValue([hint]))),map=historySpeakerHints(decoded);assert.equal(map.get(hint.at)?.style.scale,16/18);assert.equal(map.get(hint.at)?.text,hint.text);assert.equal(historySpeakerHints(undefined).size,0);assert.equal(historySpeakerHints([]).size,0);
});
test('bad paths, duplicate source addresses, unbounded breaks and invalid source styles reject',()=>{
 for(const value of [[hint,hint],[{...hint,at:'../private'}],[{...hint,before:5}],[{...hint,after:1.5}],[{...hint,text:''}],[{...hint,style:{fontSize:16,baseSize:18,color:'url(unknown)'}}]])assert.throws(()=>historySpeakerHints(value));
});
