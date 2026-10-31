import type {DoorIR,DoorToken} from './door-ir.js';import {requireValue} from './kag.js';
/** Cut only at declared source control boundaries; retain the original PO page identities. */
export function doorSegment(ir:DoorIR,start:number,end:number):DoorIR {
 requireValue(start>=0&&end>start&&end<=ir.tokens.length,'DOOR_SEGMENT_RANGE');let tokens=ir.tokens.slice(start,end);const open=new Map<string,number>();
 for(const [i,t]of ir.tokens.entries()){if(t.kind==='page-start')open.set(t.page.context,i);if(t.kind!=='page-end')continue;const a=open.get(t.page.context);requireValue(a!==undefined,'DOOR_SEGMENT_PAGE');if(a<start&&i>=start&&i<end)tokens.unshift(ir.tokens[a]!);if(a>=start&&a<end&&i>=end){requireValue(!ir.tokens.slice(a,end).some(t=>t.kind==='text'&&t.text.trim()),'DOOR_SEGMENT_PARTIAL_TEXT');tokens=tokens.filter(v=>v.kind!=='page-start'||v.page.context!==t.page.context);}}
 const contexts=new Set(tokens.flatMap(t=>t.kind==='page-start'?[t.page.context]:[]));return {...ir,tokens:tokens.filter(t=>t.kind!=='page-end'||contexts.has(t.page.context)),extraction:{...ir.extraction,pages:ir.extraction.pages.filter(p=>contexts.has(p.context))}};
}
export function sourceChoices(ir:DoorIR){const out:{start:number;end:number;tokens:DoorToken[]}[]=[];for(let i=0;i<ir.tokens.length;i++){const t=ir.tokens[i];if(t?.kind!=='tag'||t.name!=='choice')continue;const end=ir.tokens.findIndex((t,n)=>n>i&&t.kind==='tag'&&t.name==='s');requireValue(end>i&&!ir.tokens.slice(i+1,end).some(t=>t.kind==='tag'&&t.name==='choice'),'SOURCE_CHOICE_SCOPE');out.push({start:i,end:end+1,tokens:ir.tokens.slice(i,end+1)});i=end;}return out;}
export function menuIR(ir:DoorIR,tokens:readonly DoorToken[]):DoorIR{return {...ir,tokens:[...tokens],extraction:{...ir.extraction,pages:[]}};}
