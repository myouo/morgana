import {acceptsBrotli} from './encoding.js';
import {byteRange} from './range.js';
const mediaPath=/^\/assets\/(?:shared|locales\/[A-Za-z0-9-]+)\/(?:images|audio|fonts)\/([a-f0-9]{64})\.(?:png|jpg|ogg|mp3|wav|ttf)$/u;
function reply(message:string,status:number,headers:HeadersInit={}):Response{return new Response(message,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});}
async function authenticated(request:Request,secret:string|undefined):Promise<boolean>{
 if(!secret)return false;const received=request.headers.get('Authorization')??'';if(received.length>512)return false;
 const digest=(value:string)=>crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));const [a,b]=await Promise.all([digest(received),digest(secret)]);return crypto.subtle.timingSafeEqual(a,b);
}
function matches(header:string|null,etag:string,weak=false):boolean{return !!header&&header.split(',').some(raw=>{const value=raw.trim();return value==='*'||(weak?value.replace(/^W\//u,''):value)===etag;});}
async function serve(request:Request,env:Env,ctx:ExecutionContext):Promise<Response>{
  if(env.DEPLOYMENT_KIND!=='preview'&&!await authenticated(request,env.TEST_AUTH))return reply('Authentication required',401,{'WWW-Authenticate':'Basic realm="Morgana network test", charset="UTF-8"'});
  if(!['GET','HEAD'].includes(request.method))return reply('Method not allowed',405,{Allow:'GET, HEAD'});
  const url=new URL(request.url),match=mediaPath.exec(url.pathname);
  if(!match){
   const protobuf=/^\/(?:programs|text|compat)\/.+\.pb$/u.test(url.pathname);
   let result:Response|undefined,compressed=false;
   if(protobuf&&!request.headers.has('Range')&&acceptsBrotli(request.headers.get('Accept-Encoding'))){const encoded=new URL(url);encoded.pathname+='.br';const sourceHeaders=new Headers(request.headers);sourceHeaders.set('Accept-Encoding','identity');const candidate=await env.SITE.fetch(new Request(encoded,{method:request.method,headers:sourceHeaders}));if(candidate.ok||candidate.status===304){result=candidate;compressed=true;}else await candidate.body?.cancel();}
   result??=await env.SITE.fetch(request);const headers=new Headers(result.headers);headers.set('Cache-Control','private, no-cache');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');if(protobuf)headers.set('Vary','Accept-Encoding');if(compressed){headers.set('Content-Type','application/x-protobuf');headers.set('Content-Encoding','br');return new Response(result.body,{status:result.status,headers,encodeBody:'manual'});}return new Response(result.body,{status:result.status,headers});
  }
  if(url.searchParams.has('galbox-version')&&url.searchParams.get('galbox-version')!==`sha256-${match[1]}`)return reply('Version changed',412);
  const key=url.pathname.slice(1),etag=`"sha256-${match[1]}"`,cacheKey=new Request(url.origin+url.pathname);
  let full=await caches.default.match(cacheKey),meta:R2Object|null=null;
  const cachedLength=full?.headers.get('Content-Length');
  if(full&&(full.status!==200||full.headers.get('ETag')!==etag||!cachedLength||!/^\d+$/u.test(cachedLength)||!Number.isSafeInteger(Number(cachedLength))||!full.headers.get('Content-Type'))){await full.body?.cancel();full=undefined;}
  // SHA-addressed immutable entries carry their metadata too; a hit needs no R2 HEAD.
  if(!full){meta=await env.MEDIA.head(key);if(!meta)return reply('Resource not found',404);}
  const size=full?Number(cachedLength):meta!.size,mime=full?.headers.get('Content-Type')??meta?.httpMetadata?.contentType??'application/octet-stream';
  const headers=new Headers({'ETag':etag,'Accept-Ranges':'bytes','Content-Type':mime,'Cache-Control':'private, max-age=31536000, immutable','X-Content-Type-Options':'nosniff','Vary':'Authorization'});
  if(request.headers.has('If-Match')&&!matches(request.headers.get('If-Match'),etag)){await full?.body?.cancel();return reply('Version changed',412,{'ETag':etag});}
  if(matches(request.headers.get('If-None-Match'),etag,true)){await full?.body?.cancel();return new Response(null,{status:304,headers});}
  const ifRange=request.headers.get('If-Range'),range=byteRange(ifRange&&ifRange!==etag?null:request.headers.get('Range'),size);
  if(range==='invalid'){await full?.body?.cancel();return reply('Unsatisfiable range',416,{'Content-Range':`bytes */${size}`,'Accept-Ranges':'bytes'});}
  headers.set('Content-Length',String(range?.length??size));if(range)headers.set('Content-Range',`bytes ${range.offset}-${range.offset+range.length-1}/${size}`);
  const status=range?206:200;if(request.method==='HEAD'){if(full)headers.set('X-Morgana-Cache','HEAD-HIT');await full?.body?.cancel();return new Response(null,{status,headers});}
  // Regression authorization is checked before the edge cache; the preview is public.
  const lookup=range?new Request(cacheKey,{headers:{Range:`bytes=${range.offset}-${range.offset+range.length-1}`}}):cacheKey;
  if(range)await full?.body?.cancel();
  const cache=range?await caches.default.match(lookup):full;
  if(cache&&cache.status===status&&cache.headers.get('ETag')===etag&&cache.headers.get('Content-Length')===headers.get('Content-Length')&&(!range||cache.headers.get('Content-Range')===headers.get('Content-Range'))){const hit=new Headers(headers);hit.set('X-Morgana-Cache',range?'RANGE-HIT':'HIT');return new Response(cache.body,{status,headers:hit});}
  if(cache?.body)await cache.body.cancel();
  meta??=await env.MEDIA.head(key);if(!meta||meta.size!==size)return reply('Resource version changed; retry',503);
  const object=await env.MEDIA.get(key,{onlyIf:{etagMatches:meta.etag},...(range?{range}:{})});if(!object||!('body'in object))return reply('Resource version changed; retry',503);
  headers.set('X-Morgana-Cache',range?'RANGE':'MISS');const response=new Response(object.body,{status,headers});
  // Cache only complete representations, bounded to limit the tee's possible buffering.
  // A 0-to-EOF range becomes a full 200 cache entry; partial 206s are never stored.
  if(meta.size<=8*1024*1024&&(!range||range.offset===0&&range.length===meta.size)){const cacheHeaders=new Headers(headers);cacheHeaders.set('Cache-Control','public, max-age=31536000');cacheHeaders.delete('Vary');cacheHeaders.delete('Content-Range');const cached=new Response(response.clone().body,{status:200,headers:cacheHeaders});ctx.waitUntil(caches.default.put(cacheKey,cached).catch(()=>console.error('R2_EDGE_CACHE_PUT_FAILED')));}
  return response;
}
export default {
 async fetch(request:Request,env:Env,ctx:ExecutionContext):Promise<Response>{const response=await serve(request,env,ctx);response.headers.set('X-Morgana-Deployment',env.DEPLOYMENT_KIND);return response;}
} satisfies ExportedHandler<Env>;
