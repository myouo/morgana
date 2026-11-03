import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {encodeWire} from 'galbox-sdk/wire';
import {hash} from './locale.js';
import type {Language} from './locale.js';
import {tokenize,requireValue} from './kag.js';
import {extractChapter} from './ks-po.js';
import {chapters} from './chapter-catalog.js';
import {readOpening} from './opening.js';
import {readPrologue} from './prologue.js';

/** KAG currentPageName changes only on a nonempty literal label caption. */
export async function saveBookmarkParts(locale:Language,root:string){
 const names=new Map<string,string>(),files=new Map<string,{raw:string;labels:{line:number;name:string}[]}>(),specs=chapters.filter(c=>['door1','interlude1','memory1','door2','door3','search','door4','scenario5','badend1','badend2','badend3'].includes(c.id));
 for(const file of new Set(specs.map(c=>c.file))){const raw=await readFile(`private/text/${locale}/scenario/${file}`,'utf8'),labels=tokenize(raw,file).flatMap(t=>t.kind==='label'&&t.title?[{line:t.source.line,name:t.title}]:[]);requireValue(labels.every(l=>!l.name.startsWith('&')),'SAVE_BOOKMARK_EXPRESSION');files.set(file,{raw,labels});}
 const nameAt=(file:string,line:number)=>{const data=files.get(file);requireValue(data,'SAVE_BOOKMARK_FILE');let name='';for(const l of data.labels){if(l.line>line)break;name=l.name;}return name;},add=(id:string,name:string)=>{const old=names.get(id);requireValue(old===undefined||old===name,'SAVE_BOOKMARK_ID '+id);names.set(id,name);};
 for(const spec of specs)for(const page of extractChapter(files.get(spec.file)!.raw,spec).pages)add(hash(page.context).slice(0,24),nameAt(spec.file,page.source.line));
 const scenario=files.get('scenario.ks')!.raw,macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8');for(const page of [...readOpening(scenario,'scenario.ks').pages,...readPrologue(scenario,macro,['jp','zh','ko'].includes(locale)?22:18).pages])add(page.id,nameAt('scenario.ks',page.source.line));
 const groups=new Map<string,string[]>();for(const [id,name]of names){const ids=groups.get(name)??[];ids.push(id);groups.set(name,ids);}const rows=[...groups].flatMap(([name,ids])=>Array.from({length:Math.ceil(ids.length/256)},(_,i)=>({name,ids:ids.slice(i*256,(i+1)*256)}))),parts=[];
 for(let i=0;i<rows.length;i+=32){const bytes=encodeWire('JsonValue',rows.slice(i,i+32)),sha256=hash(bytes),path=`text/save-names/${sha256}.pb`;await mkdir(root+'/text/save-names',{recursive:true});await writeFile(root+'/'+path,bytes);parts.push({path,sha256});}requireValue(parts.length<=8,'SAVE_BOOKMARK_PART_LIMIT');return parts;
}
