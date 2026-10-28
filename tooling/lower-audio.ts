import {audioTrack,bgmTrack,sfxTrack,audioSourceFade,audioFadeOutAndStop,audioSourceStop,audioSourceGain,instruction} from 'galbox-sdk/port-kit';
import type {ProgramBuilder,AssetRef,SfxBufferRef,BgmBufferRef} from 'galbox-sdk/port-kit';
import type {Instruction} from 'galbox-sdk/protocol';
import {strictArgs,literalArg,requireValue} from './kag.js';import type {Tag} from './kag.js';
export type SourceAudioResolver=(storage:string,role:'bgm'|'sfx',loop:boolean)=>Promise<AssetRef<'audio'>|null>;
export const sourceAudioTags=new Set(['playbgm','playse','fadeinbgm','fadeinse','stopbgm','stopse','fadeoutbgm','fadeoutse','xchgbgm','bgmopt','seopt','ws']);
interface Lane {task:string;loop:boolean;}
const registeredBuffers=new WeakMap<ProgramBuilder,Map<number,SfxBufferRef>>(),registeredAlternate=new WeakMap<ProgramBuilder,BgmBufferRef>();
/** Source-script state is compiled into ordinary SDK instructions. Runtime media
 * completion and delayed envelopes remain owned by Core/Host. */
export class SourceAudioLowerer {
 private inFlight=false;private readonly buffers:Map<number,SfxBufferRef>;private alternate:BgmBufferRef|undefined;private bgmBank='bgm';private bgmStorage='';private readonly active=new Map<string,Lane>();private readonly volumes=new Map<string,number>();
 constructor(private readonly builder:ProgramBuilder,private readonly resolve:SourceAudioResolver,initial?:{bgm:string}){let buffers=registeredBuffers.get(builder);if(!buffers){buffers=new Map();registeredBuffers.set(builder,buffers);}this.buffers=buffers;if(initial)this.active.set('bgm',{task:initial.bgm,loop:true});}
 references():string[]{return [...new Set([...this.active.values()].map(v=>v.task))];}
 async lower(tag:Tag,at:string):Promise<Instruction[]>{requireValue(!this.inFlight,'SOURCE_AUDIO_CONCURRENT');this.inFlight=true;const owned={...tag,args:{...tag.args},attributes:tag.attributes.map(a=>({...a,source:{...a.source}})),source:{...tag.source}};try{return await this.one(owned,at);}finally{this.inFlight=false;}}
 private async one(tag:Tag,at:string):Promise<Instruction[]>{
  requireValue(sourceAudioTags.has(tag.name),'SOURCE_AUDIO_UNSUPPORTED '+tag.name);requireValue(tag.attributes.every(a=>a.mode==='literal'),'SOURCE_AUDIO_DYNAMIC');
  const bgm=tag.name.endsWith('bgm')||tag.name==='bgmopt',role=bgm?'bgm':'sfx',slot=tag.args.buf===undefined?0:Number(literalArg(tag,'buf'));requireValue(Number.isInteger(slot)&&slot>=0&&slot<=7&&(!bgm||slot===0),'SOURCE_AUDIO_BUFFER');const lane=bgm?this.bgmBank:`se-${slot}`,volumeKey=bgm?'bgm':lane;
  if(tag.name==='seopt'||tag.name==='bgmopt'){strictArgs(tag,['volume','buf']);const volume=Number(literalArg(tag,'volume'));requireValue(Number.isFinite(volume)&&volume>=0&&volume<=200,'SOURCE_AUDIO_VOLUME');this.volumes.set(volumeKey,volume);const lanes=bgm?['bgm','bgm-alt']:[lane];return lanes.flatMap((id,n)=>{const source=this.active.get(id);return source?[audioSourceGain(at+':'+n,source.task,Math.min(1,volume/100),{inactive:'ignore'})]:[];});}
  if(tag.name==='ws'){strictArgs(tag,['buf','canskip']);requireValue(tag.args.canskip===undefined||['true','false'].includes(tag.args.canskip),'SOURCE_AUDIO_WAIT');const source=this.active.get(lane);return source&&!source.loop?[instruction('audio.wait',{at,task:source.task,inactive:'ignore'})]:[];}
  if(tag.name==='xchgbgm'){
   strictArgs(tag,['storage','time']);const storage=literalArg(tag,'storage'),time=tag.args.time===undefined?5000:Number(literalArg(tag,'time'));requireValue(Number.isInteger(time)&&time>=0&&time<=1800000,'SOURCE_AUDIO_TIME');if(storage===this.bgmStorage)return [];const asset=await this.resolve(storage,'bgm',true),old=this.active.get(this.bgmBank),next=old?(this.bgmBank==='bgm'?'bgm-alt':'bgm'):'bgm',task=at+'-source',target=Math.min(1,(this.volumes.get('bgm')??100)/100),code:Instruction[]=[];
   requireValue(asset,'SOURCE_AUDIO_MISSING_BGM');if(old)code.push(...(time?[audioFadeOutAndStop(at+':out',at+'-out',old.task,time,{policy:'replace',inactive:'ignore'})]:[audioSourceStop(at+':out',old.task,{inactive:'ignore'})]));
   if(next==='bgm-alt'){this.alternate??=registeredAlternate.get(this.builder);if(!this.alternate){this.alternate=this.builder.bgmBuffer('kag-bgm-alt');registeredAlternate.set(this.builder,this.alternate);}code.push(bgmTrack(at,task,asset,this.alternate,{gain:time?0:target,loop:true,restore:'replay'}));}else code.push(audioTrack(at,task,asset,{channel:'bgm',gain:time?0:target,loop:true,restore:'replay'}));
   if(time)code.push(audioSourceFade(at+':in',at+'-in',task,target,time,{delayMs:old?time:0,policy:'replace',inactive:'ignore'}));this.active.set(next,{task,loop:true});this.bgmBank=next;this.bgmStorage=storage;return code;
  }
  const play=tag.name.startsWith('play')||tag.name.startsWith('fadein'),fade=tag.name.startsWith('fade');strictArgs(tag,['buf',...(play?['storage','loop']:[]),...(fade?['time']:[])]);const duration=fade?(tag.args.time===undefined?5000:Number(literalArg(tag,'time'))):0;requireValue(Number.isInteger(duration)&&duration>=0&&duration<=3600000,'SOURCE_AUDIO_TIME');
  if(play){const storage=literalArg(tag,'storage'),loop=tag.args.loop===undefined?bgm:literalArg(tag,'loop')==='true';requireValue(tag.args.loop===undefined||['true','false'].includes(tag.args.loop),'SOURCE_AUDIO_LOOP');if(tag.name==='playbgm'&&storage===this.bgmStorage)return [];const asset=await this.resolve(storage,role,loop),task=at+'-source',nominal=(this.volumes.get(volumeKey)??100)/100,gain=Math.min(1,nominal),options={gain:tag.name.startsWith('fadein')&&duration?0:gain,loop,restore:'replay' as const},code:Instruction[]=[];
   if(!asset){requireValue(!bgm,'SOURCE_AUDIO_MISSING_BGM');const previous=this.active.get(lane);this.active.delete(lane);return previous?[audioSourceStop(at,previous.task,{inactive:'ignore'})]:[];}
   if(bgm){for(const [n,id]of ['bgm','bgm-alt'].entries()){const prior=this.active.get(id);if(prior)code.push(audioSourceStop(at+':stop'+n,prior.task,{inactive:'ignore'}));}code.push(audioTrack(at,task,asset,{...options,channel:'bgm'}));}else{let buffer=this.buffers.get(slot);if(!buffer){buffer=this.builder.sfxBuffer('kag-se-'+slot);this.buffers.set(slot,buffer);}code.push(sfxTrack(at,task,asset,buffer,options));}
   if(tag.name.startsWith('fadein')&&duration)code.push(audioSourceFade(at+':fade',at+'-fade',task,gain,Math.max(1,Math.ceil(duration/Math.max(1,nominal))),{policy:'replace',inactive:'ignore'}));
   if(bgm){this.active.delete('bgm-alt');this.bgmBank='bgm';this.bgmStorage=loop?storage:'';this.active.set('bgm',{task,loop});}else this.active.set(lane,{task,loop});return code;
  }
  const source=this.active.get(lane);if(tag.name==='stopbgm'){const code=[...this.active.entries()].filter(([id])=>id==='bgm'||id==='bgm-alt').map(([,value],n)=>audioSourceStop(at+(n?':'+n:''),value.task,{inactive:'ignore'}));this.active.delete('bgm');this.active.delete('bgm-alt');this.bgmStorage='';return code;}
  if(!source)return [];const code=tag.name.startsWith('fadeout')&&duration?[audioFadeOutAndStop(at,at+'-fade',source.task,duration,{policy:'replace',inactive:'ignore'})]:[audioSourceStop(at,source.task,{inactive:'ignore'})];if(!fade||duration===0)this.active.delete(lane);if(bgm)this.bgmStorage='';return code;
 }
}
