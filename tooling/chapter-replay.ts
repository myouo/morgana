import {sceneExtra,musicExtra,extrasCatalog,expr,instruction} from 'galbox-sdk/port-kit';
import type {ProgramBuilder,AssetRef} from 'galbox-sdk/port-kit';
import {bool} from 'galbox-sdk/protocol';
import {tokenize,literalArg,requireValue} from './kag.js';
export const firstDoorFlag='original.scenario1';
/** First source replay page only. Catalog creation still requires real declared
 * chapter bodies at link time; this never unlocks an unfinished game chapter. */
export function sourceReplayCatalog(builder:ProgramBuilder,chapterSource:string,titles:{prologue:string;door1:string},music?:AssetRef<'audio'>){
 const tokens=tokenize(chapterSource,'chapter.ks'),begin=tokens.findIndex(t=>t.kind==='tag'&&t.name==='if'&&t.args.exp?.replace(/\s/gu,'')==='sf.scenario1==true');requireValue(begin>=0,'CHAPTER_REPLAY_GATE');let depth=1,end=begin+1;for(;end<tokens.length;end++){const t=tokens[end];if(t?.kind==='tag'){if(t.name==='if')depth++;else if(t.name==='endif'&&--depth===0)break;}}requireValue(depth===0,'CHAPTER_REPLAY_GATE');const targets=tokens.slice(begin+1,end).flatMap(t=>t.kind==='tag'&&t.name==='button'?[literalArg(t,'target')]:[]);requireValue(targets.includes('*prologstart')&&targets.includes('*scenario1start'),'CHAPTER_REPLAY_ENTRIES');
 const gate=expr.profile('bool',firstDoorFlag,bool(false)),prologue=sceneExtra('prologue','prologue',{title:titles.prologue,unlock:gate}),door1=sceneExtra('door1','door1',{title:titles.door1,unlock:gate});builder.extras(extrasCatalog('original-chapters','first-door-v1',[prologue,door1,...(music?[musicExtra('chapter-menu',music,{title:titles.door1,loop:true,unlock:expr.flag(true)})]:[])]));return {prologue,door1};
}
export function firstDoorCompletion(source:string,at:string){const tokens=tokenize(source,'scenario.ks'),finish=tokens.findIndex(t=>t.kind==='label'&&t.name==='zero3'),flag=tokens.findIndex(t=>t.kind==='tag'&&t.name==='eval'&&t.args.exp?.replace(/\s/gu,'')==='sf.scenario1=true');requireValue(finish>flag&&flag>=0,'CHAPTER_COMPLETION_SOURCE');return instruction('profile.set',{at,key:firstDoorFlag,value:bool(true)});}
