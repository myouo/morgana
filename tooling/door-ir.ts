import {readFile} from 'node:fs/promises';
import {parse} from 'smol-toml';
import {tokenize,requireValue} from './kag.js';
import type {Token,SourcePoint} from './kag.js';
import {extractChapter,checkControls} from './ks-po.js';
import type {ChapterPage,ChapterExtraction} from './ks-po.js';
import {readPO} from './po.js';
import type {POMessage} from './po.js';
import {hash} from './locale.js';
import type {ChapterSpec} from './chapter-catalog.js';
export type DoorToken=Token|{kind:'page-start';page:ChapterPage;source:SourcePoint}|{kind:'page-end';page:ChapterPage;source:SourcePoint};
export interface DoorIR {tokens:DoorToken[];extraction:ChapterExtraction;localized:Map<string,POMessage>;}
const position=(p:SourcePoint)=>`${p.line}:${p.column}`;
/** Reinsert only PO text, leaving every native control/label in its original order.
 * Translation text is never tokenized as KS or executed as an expression. */
export async function readDoorIR(source:string,locale:string,options?:{chapter:ChapterSpec;catalogRoot?:'locales'|'artifacts/chapter-catalogs'}):Promise<DoorIR>{
 const spec:ChapterSpec=options?.chapter??{id:'door1',file:'scenario.ks',start:'scenario1start',end:'zero3'};
 requireValue(/^[a-zA-Z][a-zA-Z0-9_-]{0,31}$/u.test(spec.id)&&/^[a-zA-Z][a-zA-Z0-9-]{0,31}$/u.test(locale),'DOOR_CATALOG_PATH');
 const root=`${options?.catalogRoot??'locales'}/${locale}/chapters/${spec.id}`,contract:unknown=parse(await readFile(root+'/catalog.toml','utf8'));requireValue(contract&&typeof contract==='object'&&!Array.isArray(contract)&&'chapter'in contract&&contract.chapter===spec.id&&'files'in contract&&Array.isArray(contract.files)&&'source_sha256'in contract&&contract.source_sha256===hash(source),'DOOR_SOURCE_CONTRACT');
 const messages=new Map<string,POMessage>();for(const file of contract.files){requireValue(typeof file==='string'&&/^[a-zA-Z0-9_-]+\.po$/u.test(file),'DOOR_PO_FILE');for(const [id,value]of await readPO(root+'/'+file,locale)){requireValue(!messages.has(id),'DOOR_PO_DUPLICATE');messages.set(id,value);}}
 const extraction=extractChapter(source,spec),all=tokenize(source,spec.file),begin=all.findIndex(t=>t.kind==='label'&&t.name===spec.start),last=spec.end?all.findIndex((t,i)=>i>begin&&t.kind==='label'&&t.name===spec.end):all.length,native=all.slice(begin,last),indices=new Map(native.map((t,i)=>[position(t.source),i]));
 requireValue(begin>=0&&last>begin&&messages.size===extraction.pages.length,'DOOR_SCOPE');
 const starts=new Map<number,{page:ChapterPage;prefix:string}>(),ends=new Map<number,ChapterPage>(),controls=new Map<number,{text:string;c:boolean}>(),ignored=new Set<number>();
 for(const page of extraction.pages){const message=messages.get(page.context);requireValue(message,'DOOR_PO_MISSING '+page.context);checkControls(message.text,page.controls.map(c=>c.id));const pieces=message.text.split(/⟪k:\d+⟫/gu),locations=page.controls.map(c=>{const index=indices.get(position(c.tag.source));requireValue(index!==undefined,'DOOR_CONTROL_POSITION');return index;}),textIndex=indices.get(position(page.source));requireValue(textIndex!==undefined,'DOOR_TEXT_POSITION');const start=Math.min(textIndex,...locations);
  let end=native.length;for(let i=start;i<native.length;i++){const t=native[i]!;if(page.ending==='p'&&t.kind==='tag'&&t.name==='p'||page.ending==='label'&&i>textIndex&&t.kind==='label'||page.ending==='cm'&&i>textIndex&&t.kind==='tag'&&t.name==='cm'){end=i;break;}}
  requireValue(end>start&&!starts.has(start)&&!ends.has(end),'DOOR_PAGE_BOUNDARY '+page.context);starts.set(start,{page,prefix:pieces[0]!});ends.set(end,page);
  for(let i=start;i<end;i++){if(native[i]?.kind==='text'){requireValue(!ignored.has(i),'DOOR_OVERLAPPING_TEXT');ignored.add(i);}}
  for(const [n,index]of locations.entries()){requireValue(index<end&&!controls.has(index),'DOOR_CONTROL_BOUNDARY');const token=native[index];requireValue(token?.kind==='tag','DOOR_CONTROL_KIND');controls.set(index,{text:pieces[n+1]!,c:token.name==='c'});}
 }
 const output:DoorToken[]=[];
 for(let i=0;i<=native.length;i++){const t=native[i],end=ends.get(i);if(end)output.push({kind:'page-end',page:end,source:t?.source??end.source});const start=starts.get(i);if(start){output.push({kind:'page-start',page:start.page,source:native[i]!.source});if(start.prefix)output.push({kind:'text',text:start.prefix,source:start.page.source});}
  if(!t)break;if(end&&t.kind==='tag'&&t.name==='p')continue;if(ignored.has(i))continue;const control=controls.get(i);
  if(control?.c){requireValue(t.kind==='tag','DOOR_C');output.push({...t,args:{text:control.text},attributes:t.attributes.map(a=>a.name==='text'?{...a,value:control.text}:a)});}
  else {output.push(t);if(control?.text)output.push({kind:'text',text:control.text,source:t.source});}
 }
 requireValue(output.filter(t=>t.kind==='page-end').length===extraction.pages.length,'DOOR_PAGE_COUNT');return {tokens:output,extraction,localized:messages};
}
