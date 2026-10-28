import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const report=JSON.parse(await readFile(process.argv[2]??'artifacts/browser/results.json','utf8')),rows=[];
function visit(value){if(!value||typeof value!=='object')return;if(value.name==='real-reading-network'&&value.body)rows.push(JSON.parse(Buffer.from(value.body,'base64').toString()));for(const child of Object.values(value))visit(child);}
visit(report);assert.equal(rows.length,4,'Expected demand and 2/4/8-page cold routes');const demand=rows.find(r=>r.mode==='demand'),balanced=rows.find(r=>r.mode==='balanced'&&r.pages===4);assert.ok(demand&&balanced);
for(const row of rows){assert.deepEqual(row.rows.map(r=>r.id),demand.rows.map(r=>r.id),'Compare the same source route and confirmations');for(const key of ['latency','bytesPerSecond','readingMs'])assert.equal(row[key],demand[key]);}
assert.deepEqual(rows.filter(r=>r.mode==='balanced').map(r=>r.pages).sort((a,b)=>a-b),[2,4,8]);
// Resource waits now keep audio running for every policy, including demand.
// The controlled SDK prefetch tests verify preparation and handoff; this real
// route reports latency, including authored transitions and fresh branches.
for(const row of rows){assert.equal(row.resourcePauses,0,'Resource waits must preserve music for every loading policy');assert.ok(row.rows.length>65,'Expected the complete source route');assert.ok(row.rows.every(r=>Number.isFinite(r.advanceMs)&&r.advanceMs>=0&&r.resident<=67108864),'Every advance must remain measured and within the resident budget');}
console.log(JSON.stringify({defaultPages:balanced.pages,advances:demand.rows.length,latency:demand.latency,bytesPerSecond:demand.bytesPerSecond,readingMs:demand.readingMs,strategies:rows.map(r=>({mode:r.mode,pages:r.pages,medianMs:r.medianMs,p95Ms:r.p95Ms,resourcePauses:r.resourcePauses,mediaWaits:r.mediaWaits,maxResident:Math.max(...r.rows.map(x=>x.resident))}))}));
