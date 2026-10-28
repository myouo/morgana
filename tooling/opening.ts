import {tokenize,requireValue,strictArgs} from './kag.js';
import {lowerLiteralText} from './text-stream.js';
import type {RichTextSourceRun} from 'galbox-sdk/protocol';
import type {KagNode} from './kag-ast.js';
import type {SourcePoint} from './kag.js';
export interface OpeningPage {id:string;text:string;runs:RichTextSourceRun[];source:SourcePoint;labelLine:number;}
export interface Opening {pages:OpeningPage[];startLine:number;endLine:number;source:string;musicFadeMs:number;}
/** A deliberately bounded source slice. Unsupported commands never disappear. */
export function readOpening(source:string,file:string):Opening {
 const lines=source.split(/\r?\n/u),entry=lines.findIndex(l=>l.trim()==='*prologstart');requireValue(entry>=0,'OPENING_ENTRY');
 const start=lines.findIndex((l,i)=>i>entry&&/^\[qmenu enabled="?true"?\]/u.test(l.trim()));requireValue(start>entry,'OPENING_PREPARED_WINDOW');
 const end=lines.findIndex((l,i)=>i>start&&l.trim().startsWith('[fadeoutbgm'));requireValue(end>start,'OPENING_END');
 const body=lines.slice(start+1,end).join('\n'),tokens=tokenize(body,file,start+1),pages:OpeningPage[]=[];let pending:KagNode[]=[],origin:SourcePoint|undefined;
 for(const t of tokens){
  if(t.kind==='script')throw new Error(`UNSUPPORTED_SCRIPT ${file}:${t.source.line}`);
  if(t.kind==='text'){requireValue(!t.text.trim(),`UNSUPPORTED_PLAIN_TEXT ${file}:${t.source.line}`);continue;}
  if(t.kind==='label'){const page=pages.at(-1);requireValue(page&&!page.id,`OPENING_LABEL ${file}:${t.source.line}`);page.id=t.name;page.labelLine=t.source.line;continue;}
  switch(t.name){
   case 'jinobun':strictArgs(t,[]);break;
   case 'c':origin??=t.source;pending.push(t);break;
   case 'r':case 'l':pending.push(t);break;
   case 'p':{strictArgs(t,[]);requireValue(origin,'OPENING_EMPTY_PAGE');const lowered=lowerLiteralText(pending);pages.push({id:'',text:lowered.content,runs:lowered.runs,source:origin,labelLine:0});pending=[];origin=undefined;break;}
   case 'cm':strictArgs(t,[]);requireValue(!pending.length,'OPENING_UNCOMMITTED_TEXT');break;
   default:throw new Error(`UNSUPPORTED_TAG ${file}:${t.source.line} [${t.name}]`);
  }
 }
 requireValue(!pending.length&&pages.length>0&&pages.every(p=>p.id),'OPENING_PAGE_ID');requireValue(new Set(pages.map(p=>p.id)).size===pages.length,'OPENING_DUPLICATE_LABEL');
 const fade=tokenize(lines[end]??'',file,end)[0];requireValue(fade?.kind==='tag'&&fade.name==='fadeoutbgm','OPENING_MUSIC_FADE');strictArgs(fade,['time']);const musicFadeMs=Number(fade.args.time);requireValue(Number.isInteger(musicFadeMs)&&musicFadeMs>0&&musicFadeMs<=3600000,'OPENING_MUSIC_FADE');
 return {pages,startLine:start+2,endLine:end,source:body,musicFadeMs};
}
