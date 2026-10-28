import {stageImage,stageTransition,stageRuleTransition,audioTrack,audioFade,instruction} from 'galbox-sdk/port-kit';
import type {AssetRef} from 'galbox-sdk/port-kit';
import type {Instruction} from 'galbox-sdk/protocol';
import type {Content} from './content.js';
import type {OpeningEffect,readTitleExit} from './presentation.js';
export interface PresentationWait {at:string;duration:number;kind:'group'|'delay';}
export async function lowerPresentation(content:Content,exit:ReturnType<typeof readTitleExit>,effects:readonly OpeningEffect[],title:AssetRef<'image'>,black:AssetRef<'image'>){
 const code:Instruction[]=[],waits:PresentationWait[]=[];
 const join=(at:string,task:string,duration:number)=>{code.push(instruction('task.join',{at,group:at,members:[task]}));waits.push({at,duration,kind:'group'});};
 code.push(stageRuleTransition('exit:menu','exit-menu','background',title,await content.rule(exit.rule),{duration:exit.ruleMs}));join('exit:menu-wait','exit-menu',exit.ruleMs);
 code.push(stageTransition('exit:black','exit-black','background',black,{duration:exit.fadeMs}));join('exit:black-wait','exit-black',exit.fadeMs);
 code.push(audioFade('exit:music-fade','exit-music-fade','bgm',0,exit.musicFadeMs));
 let index=0;for(const effect of effects){const id=`op:${String(index++).padStart(3,'0')}`;
  if(effect.kind==='music'){
   // KAG playbgm restores the script volume after a prior fade-out. The SDK bus
   // has a minimum 1 ms envelope; it settles on the next device frame.
   code.push(audioFade(id+':bus',id+'-bus','bgm',1,1,{policy:'replace'}),audioTrack(id+':music','op-music',await content.audio(effect.storage,'element'),{channel:'bgm',loop:effect.loop,restore:'replay'}));continue;
  }
  if(effect.kind==='wait'){code.push(instruction('wait.delay',{at:id+':delay',task:id+'-delay',duration:effect.duration}));waits.push({at:id+':delay',duration:effect.duration,kind:'delay'});continue;}
  const from=await content.page(effect.from),to=await content.page(effect.to),task=id+'-transition';code.push(stageImage(id+':from','background',from,{x:0,y:0,scaleX:1.6,scaleY:1.2}));
  if(effect.method==='crossfade')code.push(stageTransition(id+':transition',task,'background',to,{duration:effect.duration}));
  else {if(!effect.rule)throw new Error('PRESENTATION_RULE');code.push(stageRuleTransition(id+':transition',task,'background',to,await content.rule(effect.rule),{duration:effect.duration,vague:effect.vague}));}
  join(id+':wait',task,effect.duration);
 }
 return {code,waits};
}
