import {readFile,writeFile,mkdir,readdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {stringify} from 'smol-toml';
import {chapters} from './chapter-catalog.js';
import {extractChapter,mergeCatalog,controlIds,inspectCatalog} from './ks-po.js';
import type {CatalogMessage} from './ks-po.js';
import {languages,hash} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {requireValue} from './kag.js';

const args=process.argv.slice(2),name=args.find(a=>a!=='--staging')??'door1',staging=args.includes('--staging');requireValue(args.filter(a=>a!=='--staging').length<=1,'Usage: pnpm chapters:convert [door1|prologue|all] [--staging]');const outputRoot=staging?'artifacts/chapter-catalogs':'locales';
const selected=name==='all'?chapters:chapters.filter(c=>c.id===name);requireValue(selected.length>0,'CHAPTER_UNKNOWN '+name);
await mkdir('artifacts/chapters',{recursive:true});await mkdir('private/generated/chapters',{recursive:true});
async function optional(file:string){try{return await readFile(file,'utf8');}catch(e){if(e instanceof Error&&'code'in e&&e.code==='ENOENT')return undefined;throw e;}}
const summaries=[];
for(const spec of selected){
 const sourceLocales=await Promise.all(languages.map(async l=>({legacy:l,locale:localeInfo[l].html,extraction:extractChapter(await readFile(`private/text/${l}/scenario/${spec.file}`,'utf8'),spec)})));
 const english=sourceLocales.find(s=>s.legacy==='en')!,base=new Map(english.extraction.pages.map(p=>[p.context,p]));
 const prepared=sourceLocales.map(s=>({...s,messages:s.extraction.pages.map(p=>{const original=p.identity==='label'?base.get(p.context):undefined;if(!original)s.extraction.obligations.push({kind:'unmatched-locale-page',line:p.source.line,detail:p.context});return {context:p.context,id:original?.text??p.text,text:p.text,sourceHash:p.sourceHash,controls:controlIds(p.text),controlKinds:p.controls.map(c=>c.tag.name),scene:original?.scene??p.scene,aligned:!!original};})}));
 // Same scene partitions for every language. Extra hash buckets are introduced
 // only when a scene exceeds the explicit PO budget, never by line-number zip.
 const shards=new Map<string,number>();for(const scene of [...new Set(prepared.flatMap(s=>s.messages.map(m=>m.scene)))].map(id=>({id}))){let count=1;for(;count<=256;count*=2){let fits=true;for(const s of prepared){const groups=new Map<number,CatalogMessage[]>();for(const m of s.messages.filter(m=>m.scene===scene.id)){const b=parseInt(hash(m.context).slice(0,8),16)%count;groups.set(b,[...(groups.get(b)??[]),m]);}for(const group of groups.values()){try{mergeCatalog(s.locale,group);}catch(e){if(e instanceof Error&&e.message==='KS_PO_SIZE')fits=false;else throw e;}}}if(fits)break;}requireValue(count<=256,'CHAPTER_PARTITION_BUDGET');shards.set(scene.id,count);}
 const pendingWrites:{file:string;text:string}[]=[];
 for(const s of prepared){
  const root=`${outputRoot}/${s.locale}/chapters/${spec.id}`,groups=new Map<string,CatalogMessage[]>();
  for(const m of s.messages){const filename=/^[a-zA-Z0-9_-]+$/u.test(m.scene)?m.scene:'scene-'+hash(m.scene).slice(0,16);const count=shards.get(m.scene)!;requireValue(count,'CHAPTER_SCENE');const bucket=parseInt(hash(m.context).slice(0,8),16)%count;const file=filename+(count>1?`-${bucket.toString(16).padStart(2,'0')}`:'')+'.po';groups.set(file,[...(groups.get(file)??[]),m]);}
  await mkdir(root,{recursive:true});let fuzzy=0,preserved=0,obsolete=0;
  for(const [file,messages]of groups){const merged=mergeCatalog(s.locale,messages,await optional(path.join(root,file)));const checked=inspectCatalog(merged.po,s.locale);requireValue(checked.entries===messages.length,'CHAPTER_PO_ROUNDTRIP');fuzzy+=merged.fuzzy;preserved+=merged.preserved;obsolete+=merged.obsolete;pendingWrites.push({file:path.join(root,file),text:merged.po});}
  // Never remove a file after a chapter partition change: ask for an explicit
  // migration so translations cannot silently disappear between shards.
  const existing=(await readdir(root)).filter(f=>f.endsWith('.po'));requireValue(existing.every(f=>groups.has(f)),'CHAPTER_PARTITION_CHANGED '+root);
  const missing=english.extraction.pages.filter(p=>!s.extraction.pages.some(q=>q.context===p.context)).map(p=>p.context);
  const blockers=s.extraction.obligations.filter(o=>['unlabelled-page','text-without-page','dynamic-text','unmatched-locale-page'].includes(o.kind));
  const summary={chapter:spec.id,locale:s.locale,paragraphs:s.extraction.paragraphCount,extracted:s.extraction.pages.length,matched:s.messages.filter(m=>m.aligned).length,missingEnglish:missing.length,files:groups.size,fuzzy,preserved,obsolete,blockers:blockers.length,playable:false};summaries.push(summary);console.log(summary);
  const contract={version:1,chapter:spec.id,locale:s.locale,status:'extracted-not-compiled',source_sha256:s.extraction.sourceHash,files:[...groups.keys()].sort(),messages:s.messages.map(m=>({context:m.context,msgid_sha256:hash(m.id),controls:m.controls,control_kinds:m.controlKinds,source_locale:m.aligned?'en':s.locale,alignment:m.aligned?'stable-label':'needs-review'}))};pendingWrites.push({file:path.join(root,'catalog.toml'),text:stringify(contract)});
  await writeFile(`private/generated/chapters/${spec.id}-${s.legacy}.json`,JSON.stringify({...s.extraction,missingEnglish:missing},null,2)+'\n');
 }
 // Validate all eight locales before replacing any public catalogs. Each file
 // uses rename; rerun an interrupted batch to finish the remaining files.
 for(const {file,text}of pendingWrites){const temp=file+'.next';await writeFile(temp,text);await rename(temp,file);}
}
await writeFile(`artifacts/chapters/${name}${staging?'-staging':''}.toml`,stringify({version:1,results:summaries}));
