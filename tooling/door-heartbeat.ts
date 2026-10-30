import {readFile} from 'node:fs/promises';
import {stageTween,stageMotion,instruction} from 'galbox-sdk/port-kit';
import {requireValue,strictArgs,literalArg} from './kag.js';import type {Tag} from './kag.js';
import {stopStageMotion} from 'galbox-sdk/port-kit';
import type {DoorParticles} from './door-particles.js';
import type {DoorStage} from './door-stage.js';import type {SourceAudioLowerer} from './lower-audio.js';
/** Finite HeartBeatPlugin default: two source copies, 500ms scale/fade and y bounce.
 * Host owns animation clocks and cancellation; preprocessing owns tint/box blur. */
export class DoorHeartbeat {
 private active=false;
 constructor(private readonly stage:DoorStage,private readonly audio:SourceAudioLowerer,private readonly locale:string,private readonly particles:DoorParticles){}
 stop(){if(!this.active)return;const keys=['leaf-low','leaf-high'] as const,ids=keys.flatMap(k=>[this.stage.get(k).id,this.stage.get(k,'back').id]);this.stage.code.push(stopStageMotion(this.stage.at('heartbeat-stop'),ids,'heartbeat'));for(const id of ids){const at=this.stage.at('heartbeat-reset');this.stage.code.push(stageTween(at,at,id,{x:0,y:0,scaleX:1.6,scaleY:1.2,alpha:1},{duration:1,policy:'replace'}),instruction('task.finish',{at:at+':finish',task:at}));}for(const key of keys)for(const side of ['fore','back']){const layer=this.stage.get(key,side);layer.asset=this.stage.blank;layer.visible=false;layer.alpha=1;layer.left=layer.top=0;layer.z=key==='leaf-low'?1:90;}this.stage.invalidate(keys);this.stage.flush();this.active=false;}
 async start(t:Tag){requireValue(!this.particles.active('leaf'),'HEARTBEAT_EFFECT_SLOT_CONFLICT');strictArgs(t,['storage','sound','soundfile','color']);requireValue(t.args.sound==='on'&&!!t.args.soundfile,'HEARTBEAT_SOUND');const plugin=await readFile(`private/text/${this.locale}/others/HeartBeatPlugin.ks`,'utf8');requireValue(plugin.includes('xvalue = 240;')&&plugin.includes('yvalue = 180;')&&plugin.includes('time = 500;')&&plugin.includes('var lp = -15;')&&plugin.includes('var Fopa = 0;'),'HEARTBEAT_PROFILE');this.stop();this.stage.flush();const base=await this.stage.content.image(literalArg(t,'storage'));requireValue(base.width===800&&base.height===600,'HEARTBEAT_SIZE');const overlay=await this.stage.content.heartbeatImage(literalArg(t,'storage'),t.args.color);const at=this.stage.at('heartbeat');
  // The source plugin owns fore/back copies. Reuse the inactive plugin planes
  // already included in page composition so rules preserve their layer order.
  const keys=['leaf-low','leaf-high'] as const;for(const [n,key]of keys.entries())for(const side of ['fore','back']){const layer=this.stage.get(key,side);layer.asset=n===0?base.asset:overlay;layer.z=95+n;layer.visible=true;layer.alpha=1;layer.left=layer.top=0;}this.stage.invalidate(keys);this.stage.flush();
  const targets=['fore','back'].flatMap(side=>{const a=this.stage.get('leaf-low',side).id,o=this.stage.get('leaf-high',side).id;this.stage.code.push(stageTween(at+':hold:'+side,at+'-hold-'+side,a,{alpha:0},{duration:500,easing:'step-end'}),stageTween(at+':expand:'+side,at+'-expand-'+side,o,{x:-192,y:-108,scaleX:2.08,scaleY:1.56,alpha:0},{duration:500}));return [a];});this.stage.code.push(stageMotion(at+':bounce',at+'-bounce',targets,[{axis:'y',from:0,segments:[{to:-9,duration:250,easing:'linear'},{to:0,duration:250,easing:'linear'}]}],{key:'heartbeat',intervalMs:16}));
  const sound=literalArg(t,'soundfile'),audioTag:Tag={...t,name:'playse',args:{storage:sound,buf:'0',loop:'false'},attributes:[{name:'storage',value:sound,mode:'literal',source:t.source},{name:'buf',value:'0',mode:'literal',source:t.source},{name:'loop',value:'false',mode:'literal',source:t.source}]};this.stage.code.push(...await this.audio.lower(audioTag,at+':sound'));this.active=true;
 }
}
