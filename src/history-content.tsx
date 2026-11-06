import {HistoryText,groupHistoryEntries} from 'galbox-sdk/react';
import type {PlayerView} from 'galbox-sdk/player';
import type {TitleData} from './artwork.js';

/** Source skin over the SDK's read-only groups; no story or persistence actions. */
export function SourceHistoryContent({entries,artwork,fontSize,lineHeight,emptyText}:{entries:PlayerView['backlog']['entries'];artwork:Pick<TitleData,'history'|'historyNamePrefix'|'historyResets'>&Partial<Pick<TitleData,'historyLeading'|'historyNames'|'historyNoteNames'>>;fontSize:number;lineHeight:number;emptyText:string}){
 if(!entries.length)return <p>{emptyText}</p>;
 const sourceName=(at:string)=>artwork.historyResets.get(at)??artwork.historyNoteNames?.get(at);
 let previousBodyKey:string|null=null;
 return <>{groupHistoryEntries(entries).map(rows=>{
  const first=rows[0]!,hint=artwork.history.get(first.text.textId),body=first.text.rich?.historyAppend===undefined,profile=hint&&artwork.historyNames?.get(hint.key),name=first.text.rich&&profile?.screen===first.text.speaker?profile:undefined,key=name?.key??hint?.key??first.text.speaker,heading=body&&first.text.speaker&&hint?.showSpeaker!==false&&key!==previousBodyKey&&!artwork.historyResets.has(first.text.rich?.at??'');
  if(body)previousBodyKey=key;
  const blocks:{centered:boolean;consumeLeading:boolean;consumeNameBreak:boolean;rows:typeof first[]}[]=[];let previous:typeof first|undefined;
  for(const row of rows){const reset=sourceName(row.text.rich?.at??'');if(reset)previousBodyKey=reset.key;const centered=artwork.history.get(row.text.textId)?.centered??false,last=blocks.at(-1),leading=artwork.historyLeading?.get(row.text.rich?.at??'')??0,priorBreak=previous?.text.content.endsWith('\n')??false;if(!last||(priorBreak||leading>0||(reset?.before??0)>0)&&last.centered!==centered)blocks.push({centered,consumeLeading:!!last&&!priorBreak&&leading>0,consumeNameBreak:!!last&&!priorBreak&&leading===0&&(reset?.before??0)>0,rows:[row]});else last.rows.push(row);previous=row;}
  return <article key={first.id} data-history-id={first.id}>
   {heading&&<strong data-history-name={name?.macro} data-history-name-key={name?.key} style={{...(hint?.centered?{textAlign:'center'}:{}),...(name?{fontSize:Math.round(fontSize*name.fontSize/name.baseSize),lineHeight:`${Math.round(fontSize*name.fontSize/name.baseSize)+lineHeight-fontSize}px`}:{})}}>{name?.text??artwork.historyNamePrefix+first.text.speaker}</strong>}
   {blocks.map(block=><p key={block.rows[0]!.id} style={block.centered?{textAlign:'center'}:undefined}>{block.rows.map(row=>{const leading=artwork.historyLeading?.get(row.text.rich?.at??'')??0,reset=sourceName(row.text.rich?.at??''),size=reset?Math.round(fontSize*(reset.style.scale??1)):fontSize;return <span key={row.id} {...(row!==first?{'data-history-id':row.id}:{})} data-history-append={row.text.rich?.historyAppend}>{leading>0&&<span data-history-leading-breaks={leading} data-history-leading-at={row.text.rich?.at}>{Array.from({length:leading-(block.consumeLeading&&row===block.rows[0]?1:0)},(_,i)=><br key={i}/>)}</span>}{reset&&<span {...(artwork.historyNoteNames?.has(reset.at)?{'data-history-note-name':reset.at}:{'data-history-speaker-reset':reset.at})}>{Array.from({length:reset.before-(block.consumeNameBreak&&row===block.rows[0]?1:0)},(_,i)=><br key={'before'+i}/>)}<span style={{fontSize:size,lineHeight:`${size+lineHeight-fontSize}px`,fontWeight:reset.style.bold?'bold':'normal',fontStyle:reset.style.italic?'italic':'normal',color:reset.style.color??'#ffffff'}}>{reset.text}</span>{Array.from({length:reset.after},(_,i)=><br key={'after'+i}/>)}</span>}<HistoryText text={row.text} fontSize={fontSize} lineHeight={lineHeight} {...(row.text.rich?.historyAppend===undefined?{allowedColors:['#ff0000','#9cd0e3']}:{})} defaultColor="#ffffff" respectRevealed/></span>;})}</p>)}
  </article>;
 })}</>;
}
