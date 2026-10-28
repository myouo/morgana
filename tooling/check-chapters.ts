import {readFile,readdir} from 'node:fs/promises';
import {parse} from 'smol-toml';
import {po} from 'gettext-parser';
import {languages,hash} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {inspectCatalog,checkControls} from './ks-po.js';
import {requireValue} from './kag.js';
function object(x:unknown):asserts x is Record<string,unknown>{requireValue(!!x&&typeof x==='object'&&!Array.isArray(x),'CHAPTER_OBJECT');}
let total=0,review=0;
for(const l of languages){const locale=localeInfo[l].html,root=`locales/${locale}/chapters`;let dirs:string[];try{dirs=await readdir(root);}catch(e){if(e instanceof Error&&'code'in e&&e.code==='ENOENT')continue;throw e;}
 for(const dir of dirs){const contract:unknown=parse(await readFile(`${root}/${dir}/catalog.toml`,'utf8'));object(contract);requireValue(contract.version===1&&contract.locale===locale&&contract.chapter===dir&&Array.isArray(contract.files)&&Array.isArray(contract.messages),'CHAPTER_CONTRACT');const controls=new Map<string,number[]>(),sources=new Map<string,string>();for(const item of contract.messages){object(item);requireValue(typeof item.context==='string'&&typeof item.msgid_sha256==='string'&&/^[a-f0-9]{64}$/u.test(item.msgid_sha256)&&Array.isArray(item.controls)&&item.controls.every((v,i)=>v===i)&&!controls.has(item.context),'CHAPTER_CONTROL');controls.set(item.context,item.controls);sources.set(item.context,item.msgid_sha256);}
  const listed=new Set(contract.files);const seen=new Set<string>();let count=0;
  for(const file of contract.files){requireValue(typeof file==='string'&&/^[a-zA-Z0-9_-]+\.po$/u.test(file),'CHAPTER_FILE');const source=new TextDecoder('utf-8',{fatal:true}).decode(await readFile(`${root}/${dir}/${file}`)),stats=inspectCatalog(source,locale);count+=stats.entries;review+=stats.fuzzy;const parsed=po.parse(source,{validation:true});
   for(const [context,group]of Object.entries(parsed.translations)){if(!context)continue;for(const entry of Object.values(group)){if(entry.obsolete)continue;requireValue(!seen.has(context)&&controls.has(context),'CHAPTER_CONTEXT_SET');requireValue(hash(entry.msgid)===sources.get(context),'CHAPTER_SOURCE_CHANGED '+context);seen.add(context);checkControls(entry.msgstr[0]!,controls.get(context)!);}}
  }
  requireValue((await readdir(`${root}/${dir}`)).filter(f=>f.endsWith('.po')).every(f=>listed.has(f)),'CHAPTER_UNLISTED_PO');requireValue(seen.size===controls.size,'CHAPTER_CONTEXT_SET');total+=count;console.log(`${locale}/${dir}: ${count} editable entries; extracted, not a playable chapter`);
 }
}
requireValue(review===0,'CHAPTER_REVIEW_REQUIRED '+review);console.log(`Chapter catalogs: ${total} entries; control identities intact`);
