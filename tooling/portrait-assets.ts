import {existsSync,readFileSync} from 'node:fs';
import {mkdir,readFile,writeFile,rename,rm} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {execFile,execFileSync} from 'node:child_process';
import {promisify} from 'node:util';
import path from 'node:path';
import {hash} from './locale.js';
import type {Language} from './locale.js';
import {requireValue} from './kag.js';
import type {CharacterPart,CharacterImage} from './character-parts.js';
const exec=promisify(execFile);
export class PortraitAssets {
 private readonly found=new Map<string,{file:string;fact:CharacterImage}|null>();
 constructor(private readonly locale:Language){}
 private locate(name:string){requireValue(path.basename(name)===name&&!['.','..'].includes(name),'CHAR_ASSET_PATH');if(this.found.has(name))return this.found.get(name)!;for(const group of [this.locale,'shared'])for(const folder of ['fgimage','bgimage','image'])for(const ext of ['png','jpg']){const file=`private/extracted/${group}/${folder}/${name}.${ext}`;if(existsSync(file)){const bytes=readFileSync(file);requireValue(ext==='jpg'||bytes.subarray(1,4).toString()==='PNG','CHAR_ASSET_ENCODING');const [width,height]=ext==='png'?[bytes.readUInt32BE(16),bytes.readUInt32BE(20)]:execFileSync('magick',['identify','-ping','-format','%w %h',file],{encoding:'utf8'}).split(' ').map(Number);requireValue(width&&height,'CHAR_ASSET_SIZE');const result={file,fact:{width,height,animated:existsSync(file.slice(0,-4)+'.asd')}};this.found.set(name,result);return result;}}this.found.set(name,null);return null;}
 lookup=(name:string):CharacterImage|null=>{const result=this.locate(name);return result?{...result.fact}:null;};
 async compose(parts:readonly CharacterPart[]):Promise<{file:string;width:number;height:number;sha256:string}>{
  parts=parts.map(p=>({...p}));requireValue(parts[0]?.x===0&&parts[0]?.y===0,'CHAR_BASE_OFFSET_UNSUPPORTED');const base=parts[0]?.storage?this.locate(parts[0].storage):null;requireValue(base&&!base.fact.animated,'CHAR_BASE_REQUIRED');const layers=[];for(const p of parts){if(!p.storage)continue;const asset=this.locate(p.storage);requireValue(asset&&!asset.fact.animated,'CHAR_ASSET_UNAVAILABLE');requireValue(Number.isInteger(p.x)&&Number.isInteger(p.y),'CHAR_SUBPIXEL_COMPOSITE_UNSUPPORTED');layers.push({file:asset.file,x:p.x,y:p.y,sha256:hash(await readFile(asset.file))});}
  const key=hash(JSON.stringify({layers:layers.map(({x,y,sha256})=>({x,y,sha256})),width:base.fact.width,height:base.fact.height})),file=`private/generated/portraits/${key}.png`;await mkdir(path.dirname(file),{recursive:true});
  if(!existsSync(file)){const args=['-size',`${base.fact.width}x${base.fact.height}`,'xc:none'];for(const l of layers)args.push(l.file,'-geometry',`${l.x>=0?'+':''}${l.x}${l.y>=0?'+':''}${l.y}`,'-compose','over','-composite');const temporary=file+'.'+randomUUID()+'.png';args.push('-depth','8','-strip',temporary);try{await exec('magick',args);await rename(temporary,file);}finally{await rm(temporary,{force:true});}}
  const bytes=await readFile(file);return {file,width:base.fact.width,height:base.fact.height,sha256:hash(bytes)};
 }
 async publish(parts:readonly CharacterPart[]){const p=await this.compose(parts),assetPath=`assets/${p.sha256.slice(0,20)}.png`;await writeFile('public/'+assetPath,await readFile(p.file));return {...p,path:assetPath};}
}
