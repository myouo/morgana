import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {stringify} from 'yaml';
import {tokenize,requireValue} from './kag.js';
import {languages} from './locale.js';
async function files(root:string):Promise<string[]>{const entries=await readdir(root,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?files(path.join(root,e.name)):Promise.resolve([path.join(root,e.name)])))).flat();}
const rows=[];
for(const locale of languages){const counts:Record<string,number>={},labels:string[]=[],duplicates:string[]=[],unparsedFiles:{file:string;reason:string}[]=[];let tokens=0,scriptBlocks=0,pages=0;
 for(const file of await files(`private/text/${locale}`)){if(!file.endsWith('.ks'))continue;const source=await readFile(file,'utf8'),local=new Set<string>();for(const label of source.matchAll(/^\*([^|\r\n]+)/gmu)){const key=path.relative(`private/text/${locale}`,file)+':'+label[1];labels.push(key);if(local.has(key))duplicates.push(key);local.add(key);}let parsed;try{parsed=tokenize(source,file);}catch(error){unparsedFiles.push({file,reason:String(error)});continue;}tokens+=parsed.length;for(const t of parsed){if(t.kind==='tag'){counts[t.name]=(counts[t.name]??0)+1;if(t.name==='p')pages++;if(t.name==='iscript')scriptBlocks++;}}}
 const pageLabels=[...(await readFile(`private/text/${locale}/scenario/scenario.ks`,'utf8')).matchAll(/^\*([^|\r\n]+)/gmu)];requireValue(pageLabels.length>100,'MISSING_REAL_SCENARIO');
 rows.push({locale,tokens,pages,scriptBlocks,distinctTags:Object.keys(counts).length,scenarioLabels:pageLabels.length,duplicates:duplicates.length,unparsedFiles,tagCounts:counts,labelSet:new Set(labels)});
}
const reference=rows.find(r=>r.locale==='en');requireValue(reference,'REFERENCE_LOCALE');
const summary=rows.map(({labelSet,tagCounts,...row})=>({...row,labelsAlsoInEnglish:[...labelSet].filter(k=>reference.labelSet.has(k)).length,labelsOnlyInLocale:[...labelSet].filter(k=>!reference.labelSet.has(k)).length}));
await mkdir('artifacts/inspection',{recursive:true});await writeFile('artifacts/inspection/locales.yaml',stringify(summary));await writeFile('artifacts/inspection/tags.yaml',stringify(rows.map(({locale,tagCounts})=>({locale,tagCounts}))));console.log(stringify(summary));
