import test from 'node:test';
import assert from 'node:assert/strict';
import {byteRange} from '../deployment/range.js';
test('R2 HTTP ranges preserve inclusive endpoints, clamp bounds and reject invalid or multiple ranges',()=>{
 assert.equal(byteRange(null,100),null);assert.deepEqual(byteRange('bytes=0-9',100),{offset:0,length:10});assert.deepEqual(byteRange('bytes=95-',100),{offset:95,length:5});assert.deepEqual(byteRange('bytes=-10',100),{offset:90,length:10});assert.deepEqual(byteRange('bytes=90-200',100),{offset:90,length:10});assert.deepEqual(byteRange('bytes=-200',100),{offset:0,length:100});
 for(const value of ['bytes=','bytes=-','bytes=-0','bytes=100-','bytes=9-1','bytes=0-1,3-4','bytes=9007199254740992-'])assert.equal(byteRange(value,100),'invalid');assert.equal(byteRange('bytes=0-',0),'invalid');
});
