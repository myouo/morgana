import {tokenize,requireValue,strictArgs,literalArg} from './kag.js';
import type {ImageFrame} from 'galbox-sdk/protocol';
/** Finite ASD clip/wait loop, parsed as data; no animation script is executed. */
export function atlasAnimation(source:string,width:number,height:number,atlasWidth:number,atlasHeight:number){
 const ts=tokenize(source,'animation.asd'),first=ts[0],wait=ts[1],last=ts.at(-1);requireValue(first?.kind==='label'&&wait?.kind==='tag'&&wait.name==='wait'&&last?.kind==='tag'&&last.name==='jump','ASD_PROFILE');strictArgs(wait,['time']);strictArgs(last,['target']);requireValue(last.args.target==='*'+first.name,'ASD_LOOP_TARGET');const delayMs=Number(literalArg(wait,'time'));requireValue(Number.isInteger(delayMs)&&delayMs>=0&&delayMs<=60000,'ASD_DELAY');
 const frames:{duration:number;frame:ImageFrame}[]=[];
 for(let n=2;n<ts.length-1;n+=2){const clip=ts[n],pause=ts[n+1];requireValue(clip?.kind==='tag'&&clip.name==='clip'&&pause?.kind==='tag'&&pause.name==='wait','ASD_COMMAND');strictArgs(clip,['left','top']);strictArgs(pause,['time']);const x=Number(literalArg(clip,'left')),y=Number(literalArg(clip,'top')),duration=Number(literalArg(pause,'time'));requireValue([x,y,duration].every(Number.isInteger)&&x>=0&&y>=0&&x+width<=atlasWidth&&y+height<=atlasHeight&&duration>0&&duration<=60000,'ASD_FRAME');frames.push({duration,frame:{x,y,width,height}});}
 const [head,...rest]=frames;requireValue(head&&head.frame.x===0&&head.frame.y===0&&frames.length<=128,'ASD_INITIAL_FRAME');frames.at(-1)!.duration+=delayMs;const schedule:[typeof head,...typeof rest]=[head,...rest];return {delayMs,frames:schedule};
}
