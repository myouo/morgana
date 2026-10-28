import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const directory=process.argv[2]??'artifacts/wheel-memory',rows=[];
for(const [before,after]of [['before','final-after'],['before-dance','final-after-dance'],['before-filtered','final-after-filtered']]){
 const b=JSON.parse(await readFile(`${directory}/${before}-reclaiming.json`)),a=JSON.parse(await readFile(`${directory}/${after}-reclaiming.json`));
 for(const key of ['driverSha256','backupSha256','browser'])assert.equal(a[key],b[key],`Comparable ${key}`);
 for(const sample of [b,a]){assert.deepEqual(sample.errors,[]);for(const key of ['immediate','idle','background','resumed']){const r=sample[key];assert.equal(r.error,null);assert.equal(r.text,sample.immediate.text);assert.deepEqual(r.frames,sample.immediate.frames,'Cleanup must not advance the saved control flow');assert.ok(r.loading.residentBytes<=67108864);assert.ok(r.music,'The real cut must retain its actual BGM');assert.equal(r.music.url,sample.immediate.music.url);}
  assert.ok(sample.background.music.time>sample.idle.music.time,'Music must continue while hidden');assert.ok(sample.resumed.music.time>sample.background.music.time);assert.equal(sample.restored.before,sample.restored.after);assert.equal(sample.restored.thumbnail,true);assert.equal(sample.restored.error,null);
 }
 assert.ok(a.idle.loading.residentBytes<b.idle.loading.residentBytes,'Unreferenced resources should be reclaimed');
 assert.equal(a.resumed.canvasBytes,a.idle.canvasBytes,'Visible workspaces must be reconstructed');
 if(before==='before-filtered')assert.ok(a.background.canvasBytes<a.idle.canvasBytes,'Filtered background workspaces should be released');
 rows.push({cut:a.cut??'page-500',residentBytes:[b.idle.loading.residentBytes,a.idle.loading.residentBytes],idleHeapBytes:[b.idleHeap.usedSize,a.idleHeap.usedSize],canvasBytes:[a.idle.canvasBytes,a.background.canvasBytes,a.resumed.canvasBytes],assetCounts:[b.idle.assets,a.idle.assets]});
}
console.log(JSON.stringify(rows,null,2));
