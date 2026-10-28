import {stageImage,stageTransition,stageTween,instruction} from 'galbox-sdk/port-kit';
import type {ProgramBuilder,AssetRef} from 'galbox-sdk/port-kit';
import type {Instruction} from 'galbox-sdk/protocol';
import {PortraitAssets} from './portrait-assets.js';
import type {CharacterPart} from './character-parts.js';
import {requireValue} from './kag.js';
const references=new WeakMap<ProgramBuilder,Map<string,AssetRef<'image'>>>();
/** Compile one already-resolved authored portrait change to the production SDK. */
export async function lowerPortrait(b:ProgramBuilder,assets:PortraitAssets,parts:readonly CharacterPart[],at:string,object:string,position:{x:number;y:number},duration:number,previous?:AssetRef<'image'>):Promise<{asset:AssetRef<'image'>;code:Instruction[]}>{
 position={...position};requireValue(Number.isInteger(duration)&&duration>=0&&duration<=60000,'CHAR_DURATION');requireValue(Number.isFinite(position.x)&&Number.isFinite(position.y),'CHAR_POSITION');const p=await assets.publish(parts);let cache=references.get(b);if(!cache){cache=new Map();references.set(b,cache);}let asset=cache.get(p.sha256);if(!asset){asset=b.asset('image',{id:'portrait-'+p.sha256.slice(0,20),path:p.path,mime:'image/png',sha256:p.sha256});cache.set(p.sha256,asset);}
 const code:Instruction[]=previous?[stageImage(at+':from',object,previous,{x:position.x*1.6,y:position.y*1.2,scaleX:1.6,scaleY:1.2}),...(duration?[stageTransition(at+':transition',at+'-transition',object,asset,{duration}),instruction('task.join',{at:at+':wait',group:at+'-group',members:[at+'-transition']})]:[stageImage(at,object,asset,{x:position.x*1.6,y:position.y*1.2,scaleX:1.6,scaleY:1.2})])]:[stageImage(at,object,asset,{x:position.x*1.6,y:position.y*1.2,scaleX:1.6,scaleY:1.2,alpha:duration?0:1}),...(duration?[stageTween(at+':fade',at+'-fade',object,{alpha:1},{duration}),instruction('task.join',{at:at+':wait',group:at+'-group',members:[at+'-fade']})]:[])];return {asset,code};
}
