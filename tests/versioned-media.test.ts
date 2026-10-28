import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtemp,mkdir,writeFile,rm,symlink} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {hash} from '../tooling/locale.js';
import {versionedMedia} from '../tooling/versioned-media.js';
test('local versioned HTTP validates SHA paths, HEAD, ranges, versions and external symlinks',async()=>{
 const dir=await mkdtemp(path.join(tmpdir(),'morgana-stream-')),body=Buffer.from('original synthetic media bytes'),sha=hash(body),folder=path.join(dir,'assets/shared/audio');await mkdir(folder,{recursive:true});await writeFile(path.join(folder,sha+'.ogg'),body);const serve=versionedMedia(dir),server=createServer((req,res)=>void serve(req,res,()=>res.writeHead(418).end()));await new Promise<void>(r=>server.listen(0,'127.0.0.1',r));const address=server.address();assert.ok(address&&typeof address==='object');const url=`http://127.0.0.1:${address.port}/assets/shared/audio/${sha}.ogg`,version='sha256-'+sha,headers={'If-Match':`"${version}"`};
 try{assert.equal((await fetch(url)).status,418);const head=await fetch(url+'?galbox-version='+version,{method:'HEAD',headers});assert.equal(head.status,200);assert.equal(head.headers.get('content-length'),String(body.length));assert.equal(head.headers.get('etag'),headers['If-Match']);assert.equal((await head.arrayBuffer()).byteLength,0);
  const range=await fetch(url+'?galbox-version='+version,{headers:{...headers,Range:'bytes=2-7'}});assert.equal(range.status,206);assert.deepEqual(Buffer.from(await range.arrayBuffer()),body.subarray(2,8));assert.equal(range.headers.get('content-range'),`bytes 2-7/${body.length}`);
  assert.equal((await fetch(url+'?galbox-version=wrong')).status,412);assert.equal((await fetch(url+'?galbox-version='+version,{headers:{'If-Match':'"wrong"'}})).status,412);assert.equal((await fetch(url+'?galbox-version='+version,{headers:{Range:'bytes=999-'}})).status,416);
  await writeFile(path.join(folder,sha+'.ogg'),'bad');assert.equal((await fetch(url+'?galbox-version='+version)).status,409);
  await rm(path.join(folder,sha+'.ogg'));await symlink('/etc/hosts',path.join(folder,sha+'.ogg'));assert.equal((await fetch(url+'?galbox-version='+version)).status,404);
 }finally{server.closeAllConnections();await new Promise<void>(r=>server.close(()=>r()));await rm(dir,{recursive:true,force:true});}
});
