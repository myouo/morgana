import type {readDoorText} from './door-text.js';import {requireValue,strictArgs} from './kag.js';
export interface NoNewlineBody {id:string;at:string;macro:string;lines:number;line:number;}
/** Certify existing body paragraphs only; do not infer names for history-only rows. */
export function sourceNoNewlineBodies(story:ReturnType<typeof readDoorText>,macros:ReadonlySet<string>){
 const rows:NoNewlineBody[]=[],seen=new Set<string>();let pending:{macro:string;lines:number}|null=null;
 for(const node of story.nodes){
  if(node.kind==='tag'&&macros.has(node.tag.name)){strictArgs(node.tag,[]);pending={macro:node.tag.name,lines:0};continue;}
  if(node.kind==='tag'&&node.tag.name==='hr'&&pending){strictArgs(node.tag,[]);pending.lines++;requireValue(pending.lines<=256,'NO_NEWLINE_BODY_BREAK_BOUND');continue;}
  if(node.kind==='text'&&macros.has(node.speaker.key)&&node.recordHistory!==false&&!seen.has(node.paragraph.id)){seen.add(node.paragraph.id);requireValue(pending?.macro===node.speaker.key&&pending.lines>0,'NO_NEWLINE_BODY_NOT_EXPLICIT '+node.paragraph.id);rows.push({id:node.paragraph.id,at:node.at,macro:node.speaker.key,lines:pending.lines,line:node.paragraph.source.line});}
  pending=null;
 }
 return rows;
}
