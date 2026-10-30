import {freshProfile} from './prologue.js';
import type {Token} from './kag.js';
import {requireValue} from './kag.js';
import type {DoorIR} from './door-ir.js';
/** Data specialization of the already-declared fresh-game support set.
 * Paragraph boundaries/PO identities survive even when a native branch is empty. */
export function freshChapter(ir:DoorIR,stopBeforeLabel?:string):DoorIR {
 const stop=stopBeforeLabel?ir.tokens.findIndex(t=>t.kind==='label'&&t.name===stopBeforeLabel):ir.tokens.length;requireValue(stop>=0,'CHAPTER_SLICE_LABEL '+stopBeforeLabel);
 const scoped=ir.tokens.slice(0,stop),native=scoped.filter((t):t is Token=>t.kind!=='page-start'&&t.kind!=='page-end'),selected=new Set(freshProfile(native)),tokens=scoped.filter(t=>t.kind==='page-start'||t.kind==='page-end'||selected.has(t));
 const ended=new Set(tokens.flatMap(t=>t.kind==='page-end'?[t.page.context]:[])),unclosed=tokens.findIndex(t=>t.kind==='page-start'&&!ended.has(t.page.context));if(unclosed>=0){requireValue(tokens.slice(unclosed).every(t=>t.kind!=='text'||!t.text.trim()),'CHAPTER_SLICE_UNFINISHED_TEXT');tokens.splice(unclosed,tokens.length-unclosed,...tokens.slice(unclosed).filter(t=>t.kind!=='page-start'&&t.kind!=='page-end'&&t.kind!=='text'));}
 const contexts=new Set(tokens.flatMap(t=>t.kind==='page-start'?[t.page.context]:[]));return {...ir,tokens,extraction:{...ir.extraction,pages:ir.extraction.pages.filter(p=>contexts.has(p.context))}};
}
