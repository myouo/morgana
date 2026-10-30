import {readFile,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {inspectResource} from 'galbox-sdk/release';
import type {Asset,Program,PresentationAssetCatalog} from 'galbox-sdk/protocol';
import type {ProgramBuilder,AssetRef} from 'galbox-sdk/port-kit';
import {hash} from './locale.js';
import type {Language} from './locale.js';
import {requireValue} from './kag.js';
import type {StaticPage} from './presentation.js';
const run=promisify(execFile),composites=new Map<string,string>();
/** Asset preparation belongs to the instance; decoding/rendering stays in the SDK. */
export class Content {
 private readonly images=new Map<string,AssetRef<'image'>>();
 readonly dialogueImages=new Map<string,string>();
 private readonly visualImages=new Map<string,Asset>();
 registerDialogue(source:AssetRef<'image'>,hidden:string):void {if(source.id===hidden)return;const old=this.dialogueImages.get(source.id);requireValue(!old||old===hidden,'DIALOGUE_VARIANT_AMBIGUOUS '+source.id);this.dialogueImages.set(source.id,hidden);}
 private readonly audioRefs=new Map<string,Promise<AssetRef<'audio'>>>();
 constructor(private readonly builder:ProgramBuilder,private readonly locale:Language){}
 private source(name:string,folders:readonly string[],extensions:readonly string[]):string {
  requireValue(path.basename(name)===name&&name!=='.'&&name!=='..','CONTENT_NAME');
  for(const group of [this.locale,'shared'])for(const folder of folders)for(const ext of extensions){const file=`private/extracted/${group}/${folder}/${name}.${ext}`;if(existsSync(file)){requireValue(!existsSync(file.slice(0,-ext.length)+'asd'),'CONTENT_ANIMATION_UNSUPPORTED '+name);return file;}}
  throw new Error('CONTENT_MISSING '+name);
 }
 sourceButtonImage(name:string):string{return this.source(name,['image','bgimage','fgimage'],['png','jpg']);}
 sourceImage(name:string):string{return this.source(name,['bgimage','fgimage','image'],['png','jpg']);}
 private async compositeFile(layers:readonly {file:string;left:number;top:number}[]){const owned=layers.map(l=>({...l}));const key=hash((await Promise.all(owned.map(async l=>`${hash(await readFile(l.file))}:${l.left}:${l.top}`))).join('|'));let file=composites.get('scene:'+key);if(!file){file=`private/generated/scene-${key.slice(0,20)}.png`;const args=['-size','800x600','xc:black'];for(const l of owned){requireValue(Number.isInteger(l.left)&&Number.isInteger(l.top),'SCENE_POSITION');args.push(l.file,'-geometry',`${l.left>=0?'+':''}${l.left}${l.top>=0?'+':''}${l.top}`,'-compose','over','-composite');}args.push('-depth','8','-strip',file);await run('magick',args);composites.set('scene:'+key,file);}return file;}
 async composite(layers:readonly {file:string;left:number;top:number}[]){return this.encodedImage(await this.compositeFile(layers));}
 async visualComposite(layers:readonly {file:string;left:number;top:number}[]){return this.visualImage(await this.compositeFile(layers));}
 async interfaceImage(name:string){const source=this.sourceImage(name),bytes=await readFile(source);requireValue(bytes.subarray(1,4).toString()==='PNG','INTERFACE_PNG');const target=`assets/${hash(bytes).slice(0,20)}.png`;await writeFile('public/'+target,bytes);return {path:target,width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};}
 async encodedImage(file:string):Promise<AssetRef<'image'>>{const bytes=await readFile(file),sha=hash(bytes);let ref=this.images.get(sha);if(!ref){const target=`assets/${sha.slice(0,20)}.png`;await writeFile('public/'+target,bytes);ref=this.builder.asset('image',{id:'image-'+sha.slice(0,20),path:target,mime:'image/png',sha256:sha});this.images.set(sha,ref);}return ref;}
 private async visualImage(file:string):Promise<string>{const bytes=await readFile(file),sha=hash(bytes),target=`assets/${sha.slice(0,20)}.png`,id='dialogue-'+sha.slice(0,20);await writeFile('public/'+target,bytes);this.visualImages.set(id,{id,kind:'image',path:target,mime:'image/png',sha256:sha});return id;}
 async presentationAssets(program:Program):Promise<PresentationAssetCatalog>{
  const normal=new Map(program.assets.filter(a=>a.kind==='image').map(a=>[a.sha256,a.id]));for(const [id,asset]of this.visualImages){const reused=normal.get(asset.sha256);if(reused){for(const [source,hidden]of this.dialogueImages)if(hidden===id){if(source===reused)this.dialogueImages.delete(source);else this.dialogueImages.set(source,reused);}this.visualImages.delete(id);}}
  const assets=[...this.visualImages.values()],resources=await Promise.all(assets.map(async a=>inspectResource(a,new Uint8Array(await readFile('public/'+a.path)),b=>new TextDecoder('utf-8',{fatal:true}).decode(b))));return {version:1,assets,resources};
 }
 async image(name:string):Promise<{asset:AssetRef<'image'>;width:number;height:number}>{const source=this.sourceImage(name),key=hash(await readFile(source));let file=composites.get('raw:'+key);if(!file){file=`private/generated/raw-${key}.png`;if(!existsSync(file))await run('magick',[source,'-depth','8','-strip',file]);composites.set('raw:'+key,file);}const bytes=await readFile(file);return {asset:await this.encodedImage(file),width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};}
 async heartbeatImage(name:string,color?:string){const source=this.sourceImage(name),bytes=await readFile(source);requireValue(color===undefined||/^0x[0-9a-f]{6}$/iu.test(color),'HEARTBEAT_COLOR');const key=hash(hash(bytes)+'|'+(color??'')+'|box6'),file=`private/generated/heartbeat-${key}.png`;if(!existsSync(file)){const args=[source];if(color)args.push('-fill','#'+color.slice(2)+'64','-draw','rectangle 0,0 799,599');args.push('-statistic','Mean','13x13','-depth','8','-strip',file);await run('magick',args);}return this.encodedImage(file);}
 async solid(name:'transparent'|'white'){const file=`private/generated/${name}-800x600.png`;if(!existsSync(file))await run('magick',['-size','800x600',name==='white'?'xc:white':'xc:none','-depth','8','-strip',file]);return this.encodedImage(file);}
 async color(color:string){requireValue(/^#[0-9a-f]{6}$/iu.test(color),'SOLID_COLOR');const file=`private/generated/solid-${color.slice(1).toLowerCase()}.png`;if(!existsSync(file))await run('magick',['-size','800x600','xc:'+color,'-depth','8','-strip',file]);return this.encodedImage(file);}
 async rule(name:string){const source=this.source(name,['rule'],['png','jpg']),key=hash(await readFile(source));let file=composites.get('rule:'+key);if(!file){file=`private/generated/rule-${key.slice(0,20)}.png`;await run('magick',[source,'-depth','8','-strip',file]);composites.set('rule:'+key,file);}return this.encodedImage(file);}
 async audio(name:string,playback:'buffer'|'element'){
  const source=this.source(name,['sound','bgm'],['ogg','wav','mp3']),bytes=await readFile(source),sha=hash(bytes),ext=path.extname(source),mime=ext==='.ogg'?'audio/ogg' as const:ext==='.mp3'?'audio/mpeg' as const:'audio/wav' as const;if(playback==='buffer'){const fact=inspectResource({id:'probe',kind:'audio',mime,playback},new Uint8Array(bytes),b=>new TextDecoder('utf-8',{fatal:true}).decode(b));requireValue(fact.kind==='audio','AUDIO_FACT');if(fact.frames*1000/fact.sampleRate>30000)playback='element';}const key=sha+playback;let ref=this.audioRefs.get(key);if(!ref){ref=(async()=>{const ext=path.extname(source),file=`assets/${sha.slice(0,20)}${ext}`,mime=ext==='.ogg'?'audio/ogg':ext==='.mp3'?'audio/mpeg':'audio/wav';await writeFile('public/'+file,bytes);return this.builder.asset('audio',{id:'sound-'+sha.slice(0,16)+'-'+playback,path:file,mime,sha256:sha,playback,...(playback==='element'?{transport:{kind:'versioned-url' as const,version:'sha256-'+sha}}:{})});})();this.audioRefs.set(key,ref);}return ref;
 }
 private async pageFile(page:StaticPage){
  const layers=[];for(const layer of [page.base,page.one,page.message])if(layer.visible&&layer.storage){const file=this.source(layer.storage,['bgimage','fgimage','image'],['png','jpg']);layers.push({file,sha:hash(await readFile(file)),left:layer.left,top:layer.top});}
  requireValue(layers.every(l=>Number.isInteger(l.left)&&Number.isInteger(l.top)&&Math.abs(l.left)<=800&&Math.abs(l.top)<=600),'CONTENT_POSITION');const key=hash(layers.map(l=>`${l.sha}:${l.left}:${l.top}`).join('|'));let file=composites.get('page:'+key);
  if(!file){file=`private/generated/page-${key.slice(0,20)}.png`;const args=['-size','800x600','xc:black'];for(const l of layers)args.push(l.file,'-geometry',`${l.left>=0?'+':''}${l.left}${l.top>=0?'+':''}${l.top}`,'-compose','over','-composite');args.push('-depth','8','-strip',file);await run('magick',args);composites.set('page:'+key,file);}return file;
 }
 async page(page:StaticPage){const asset=await this.encodedImage(await this.pageFile(page));if(page.message.visible&&page.message.storage){const hidden=await this.visualImage(await this.pageFile({...page,message:{...page.message,visible:false}}));this.registerDialogue(asset,hidden);}return asset;}
}
