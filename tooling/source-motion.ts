import {tokenize,requireValue,literalArg,strictArgs} from './kag.js';
import type {Tag} from './kag.js';
export interface SourceMotionTrack {axis:'x'|'y';from:number;segments:[{to:number;duration:number;easing:'linear'|'ease-in'|'ease-out'},...{to:number;duration:number;easing:'linear'|'ease-in'|'ease-out'}[]];}
/** Definitions are selected using source call order. Macro templates and the
 * plugin's post-return examples are never treated as executed declarations. */
export function sourceMotions(files:readonly string[],allowFinalOffset=false){
 const definitions=new Map<string,Tag>();for(const file of files){let depth=0;for(const t of tokenize(file,'motion-library.ks')){if(t.kind!=='tag')continue;if(t.name==='macro'){depth++;continue;}if(t.name==='endmacro'){depth--;continue;}if(depth)continue;if(t.name==='return')break;if(t.name==='motion_define'&&t.attributes.every(a=>a.mode==='literal'))definitions.set(literalArg(t,'name'),t);}}
 return (name:string):{tracks:SourceMotionTrack[];loop:boolean;intervalMs:16}=>{const tag=definitions.get(name);requireValue(tag,'MOTION_DEFINITION '+name);strictArgs(tag,['name','locatex','locatey','loop']);requireValue(tag.args.loop===undefined||tag.args.loop==='0','MOTION_LOOP_COUNT');const tracks:SourceMotionTrack[]=[];
  for(const axis of ['x','y']as const){const value=tag.args['locate'+axis];if(value===undefined)continue;const pieces=[...value.matchAll(/\((-?\d+(?:\.\d+)?),(\d+),(-?\d+)\)/gu)];requireValue(pieces.length>0&&pieces.map(p=>p[0]).join(',')===value,'MOTION_CURVE');const segments=pieces.map(piece=>{const to=Number(piece[1]),duration=Number(piece[2]),accel=Number(piece[3]);requireValue(duration>0&&duration<=3600000&&[-2,-1,0,1,2].includes(accel),'MOTION_INTERPOLATION');return {to:to*(axis==='x'?1.6:1.2),duration,easing:accel===2?'ease-in' as const:accel===-2?'ease-out' as const:'linear' as const};}),[first,...rest]=segments;requireValue(first&&(segments.at(-1)?.to===0||allowFinalOffset&&tag.args.loop!=='0'),'MOTION_ENDPOINT');tracks.push({axis,from:0,segments:[first,...rest]});}
  requireValue(tracks.length>0,'MOTION_EMPTY');return {tracks,loop:tag.args.loop==='0',intervalMs:16};
 };
}
