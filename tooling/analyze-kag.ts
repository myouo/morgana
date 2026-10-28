import {readFile,readdir,mkdir,writeFile} from 'node:fs/promises';
import path from 'node:path';import {stringify} from 'yaml';
import {parseKag,walk} from './kag-ast.js';import {languages,hash} from './locale.js';
async function files(dir:string):Promise<string[]>{return (await Promise.all((await readdir(dir,{withFileTypes:true})).map(e=>e.isDirectory()?files(path.join(dir,e.name)):Promise.resolve(e.name.endsWith('.ks')?[path.join(dir,e.name)]:[])))).flat();}
const output='artifacts/ast';await mkdir(output,{recursive:true});const summaries=[],macros:string[][]=[['locale','file','line','name','registration','templateTokens']],edges:string[][]=[['locale','file','line','owner','tag','storage','target','resolution']];
for(const locale of languages){const root=`private/text/${locale}`,sources=await files(root),failures=[];let parsed=0,labels=0,definitions=0,embeddedScripts=0,duplicatedAttributes=0;
 for(const file of sources){try{const text=await readFile(file,'utf8'),doc=parseKag(text,path.relative(root,file),0,'raw');parsed++;labels+=doc.labels.length;
  for(const {node,owner}of walk(doc.nodes)){if(node.kind==='macro'){definitions++;macros.push([locale,doc.file,String(node.source.line),node.name??'<dynamic>','candidate; execution not evaluated',String(node.template.length)]);}if(node.kind==='script')embeddedScripts++;
   if(node.kind==='tag'){duplicatedAttributes+=node.attributes.length-new Set(node.attributes.map(a=>a.name)).size;if(['call','jump','loadplugin'].includes(node.name)){const storage=node.attributes.filter(a=>a.name===(node.name==='loadplugin'?'module':'storage')).at(-1),target=node.attributes.filter(a=>a.name==='target').at(-1);edges.push([locale,doc.file,String(node.source.line),owner??'',node.name,storage?.value??'',target?.value??'',storage?.mode==='literal'&&(!target||target.mode==='literal')?'literal candidate':storage?'dynamic or inherited':'same-file candidate']);}}
  }
 }catch(error){failures.push({file,reason:String(error)});}}
 summaries.push({locale,files:sources.length,parsed,labels,macroDefinitions:definitions,embeddedScripts,duplicatedAttributes,controlProfile:'raw control IR; macro templates unexpanded; execution/targets unresolved',failures});console.log(`${locale}: ${parsed}/${sources.length} source documents; ${definitions} macro definitions; ${duplicatedAttributes} native attribute overwrites`);
}
const tsv=(rows:string[][])=>rows.map(row=>row.map(v=>v.replace(/[\t\r\n]/gu,' ')).join('\t')).join('\n')+'\n';await writeFile(output+'/summary.yaml',stringify(summaries));await writeFile(output+'/macro-definitions.tsv',tsv(macros));await writeFile(output+'/dependencies.tsv',tsv(edges));
