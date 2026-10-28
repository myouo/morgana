import {requireValue} from './kag.js';
import {readPO,parsePO,checkSources} from './po.js';
import type {Opening,OpeningPage} from './opening.js';
import {hash} from './locale.js';
import {encodePOText,decodePOText} from './po-text.js';
export async function localizeOpening<T extends Opening>(source:T,english:Opening,locale:string,poSource?:string,poFile='story.po'):Promise<{opening:T;edited:Set<string>}>{
 const entries=poSource===undefined?await readPO(`locales/${locale}/${poFile}`,locale):parsePO(poSource,locale),expected=new Map(english.pages.map(p=>['page:'+p.id,encodePOText(p.runs)]));checkSources(entries,expected);requireValue(source.pages.length===expected.size&&source.pages.every(p=>expected.has('page:'+p.id)),'PO_PAGE_IDS');const opening=structuredClone(source),edited=new Set<string>();
 for(const page of opening.pages){const text=entries.get('page:'+page.id)!.text,decoded=decodePOText(text,page.runs);if(text!==encodePOText(page.runs)){page.text=decoded.plain;page.runs=decoded.runs;edited.add(page.id);}}
 return {opening,edited};
}

export function pageRevision(base:string,page:OpeningPage,edited:ReadonlySet<string>):string{return base+(edited.has(page.id)?'-po-'+hash(encodePOText(page.runs)).slice(0,12):'');}
