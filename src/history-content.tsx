import {HistoryText,groupHistoryEntries} from 'galbox-sdk/react';
import type {PlayerView} from 'galbox-sdk/player';
import type {TitleData} from './artwork.js';

/** Source skin over the SDK's read-only groups; no story or persistence actions. */
export function SourceHistoryContent({entries,artwork,fontSize,lineHeight,emptyText}:{entries:PlayerView['backlog']['entries'];artwork:Pick<TitleData,'history'|'historyNamePrefix'>;fontSize:number;lineHeight:number;emptyText:string}){
 if(!entries.length)return <p>{emptyText}</p>;
 let previousBodyKey:string|null=null;
 return <>{groupHistoryEntries(entries).map(rows=>{
  const first=rows[0]!,hint=artwork.history.get(first.text.textId),body=first.text.rich?.historyAppend===undefined,key=hint?.key??first.text.speaker,heading=body&&first.text.speaker&&hint?.showSpeaker!==false&&key!==previousBodyKey;
  if(body)previousBodyKey=key;
  const blocks:{centered:boolean;rows:typeof first[]}[]=[];let previous:typeof first|undefined;
  for(const row of rows){const centered=artwork.history.get(row.text.textId)?.centered??false,last=blocks.at(-1);if(!last||previous?.text.content.endsWith('\n')&&last.centered!==centered)blocks.push({centered,rows:[row]});else last.rows.push(row);previous=row;}
  return <article key={first.id} data-history-id={first.id}>
   {heading&&<strong style={hint?.centered?{textAlign:'center'}:undefined}>{artwork.historyNamePrefix+first.text.speaker}</strong>}
   {blocks.map(block=><p key={block.rows[0]!.id} style={block.centered?{textAlign:'center'}:undefined}>{block.rows.map(row=><span key={row.id} {...(row!==first?{'data-history-id':row.id}:{})} data-history-append={row.text.rich?.historyAppend}><HistoryText text={row.text} fontSize={fontSize} lineHeight={lineHeight} {...(row.text.rich?.historyAppend===undefined?{allowedColors:['#ff0000','#9cd0e3']}:{})} defaultColor="#ffffff" respectRevealed/></span>)}</p>)}
  </article>;
 })}</>;
}
