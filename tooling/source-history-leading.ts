import type {readDoorText} from './door-text.js';import {historySourceKey,historyTrailingBreakSources} from './source-history-profile.js';import {hash} from './locale.js';import {requireValue,strictArgs} from './kag.js';import type {Token} from './kag.js';
const formats=new Set(['font','resetfont','i','/i','b','/b','red','/red','blue','/blue','gray','/gray','redb','/redb','big','/big','sm','/sm','accent','/accent','hc','/hc','delay','nowait','endnowait']);
export interface SourceHistoryLeading {at:string;lines:number;line:number;}
/** Only adjacent authored hr controls; stop at labels, state changes or macros. */
export function sourceHistoryLeading(story:Pick<ReturnType<typeof readDoorText>,'nodes'>,namespace:string,tokens:readonly Token[]):SourceHistoryLeading[]{
 const enabled=new Set(story.nodes.flatMap(node=>node.kind==='tag'&&node.historyAnnotation?.enabled&&node.historyAnnotation.text.length>0?[historySourceKey(node.tag)]:[])),covered=new Set([...historyTrailingBreakSources(tokens)].flatMap(([key,breaks])=>enabled.has(key)?breaks:[])),out:SourceHistoryLeading[]=[];
 for(let n=0;n<story.nodes.length;n++){
  const node=story.nodes[n];if(node?.kind!=='tag'||!node.historyAnnotation?.enabled||!node.historyAnnotation.text)continue;let lines=0;
  for(let j=n-1;j>=0;j--){const previous=story.nodes[j]!;if(previous.kind!=='tag')break;if(previous.tag.name==='hr'){strictArgs(previous.tag,[]);if(!covered.has(historySourceKey(previous.tag)))lines++;requireValue(lines<=256,'HISTORY_LEADING_BREAK_BOUND');continue;}if(formats.has(previous.tag.name))continue;break;
  }
  if(lines)out.push({at:namespace+':history-'+hash(namespace+'|'+historySourceKey(node.tag)).slice(0,24),lines,line:node.tag.source.line});
 }
 return out;
}
