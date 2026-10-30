import {createReadStream} from 'node:fs';
import {stat,readFile,realpath} from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import type {IncomingMessage,ServerResponse} from 'node:http';
import type {Plugin} from 'vite';
import {byteRange} from '../deployment/range.js';
/** Local serving mirrors the production SHA-addressed R2 contract. No shaping. */
export function versionedMedia(root:string){
 const checked=new Map<string,string>();
 return async(req:IncomingMessage,res:ServerResponse,next:()=>void)=>{
  const url=new URL(req.url??'/','http://localhost');if(!url.searchParams.has('galbox-version')){next();return;}
  const match=/^\/assets\/(?:shared|locales\/[A-Za-z0-9-]+)\/audio\/([a-f0-9]{64})\.(ogg|wav|mp3)$/u.exec(url.pathname);if(!match){res.writeHead(404).end();return;}
  const version=`sha256-${match[1]}`,etag=`"${version}"`;if(!['GET','HEAD'].includes(req.method??'')){res.writeHead(405,{Allow:'GET, HEAD'}).end();return;}
  if(url.searchParams.get('galbox-version')!==version||req.headers['if-match']&&req.headers['if-match']!==etag){res.writeHead(412,{ETag:etag}).end();return;}
  try{const base=await realpath(root),file=await realpath(path.join(base,url.pathname.slice(1)));if(!file.startsWith(base+path.sep)){res.writeHead(404).end();return;}const info=await stat(file),identity=`${info.size}:${info.mtimeMs}`;
   if(checked.get(file)!==identity){if(createHash('sha256').update(await readFile(file)).digest('hex')!==match[1]){res.writeHead(409).end();return;}checked.set(file,identity);}
   const range=byteRange(req.headers.range??null,info.size);if(range==='invalid'){res.writeHead(416,{'Content-Range':`bytes */${info.size}`}).end();return;}
   const headers:Record<string,string>={ETag:etag,'Content-Type':match[2]==='ogg'?'audio/ogg':match[2]==='mp3'?'audio/mpeg':'audio/wav','Content-Length':String(range?.length??info.size),'Accept-Ranges':'bytes','Cache-Control':'private, max-age=31536000, immutable'};
   if(range)headers['Content-Range']=`bytes ${range.offset}-${range.offset+range.length-1}/${info.size}`;
   res.writeHead(range?206:200,headers);if(req.method==='HEAD'){res.end();return;}const stream=createReadStream(file,range?{start:range.offset,end:range.offset+range.length-1}:undefined);res.once('close',()=>stream.destroy());stream.once('error',()=>res.destroy());stream.pipe(res);
  }catch{if(!res.headersSent)res.writeHead(404).end();else res.destroy();}
 };
}
export function versionedMediaPlugin(root='generated/site'):Plugin{return {name:'morgana-versioned-media',configureServer(server){const serve=versionedMedia(root);server.middlewares.use((req,res,next)=>void serve(req,res,next));},configurePreviewServer(server){const serve=versionedMedia('dist');server.middlewares.use((req,res,next)=>void serve(req,res,next));}};}
