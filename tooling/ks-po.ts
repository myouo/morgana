import {po} from 'gettext-parser';
import type {GetTextTranslation,GetTextTranslations} from 'gettext-parser';
import {tokenize,requireValue} from './kag.js';
import type {Token,SourcePoint,Tag} from './kag.js';
import {hash} from './locale.js';
import type {ChapterSpec} from './chapter-catalog.js';

export interface TextControl {id:number;tag:Tag;}
export interface ChapterPage {
 readonly context:string; readonly scene:string; readonly text:string; readonly source:SourcePoint;
 readonly controls:readonly TextControl[]; readonly sourceHash:string; readonly identity:'label'|'anchor-sequence'; readonly ending:'p'|'label'|'cm'|'end';
}
export interface Obligation {kind:string;line:number;detail:string;}
export interface ChapterExtraction {
 spec:ChapterSpec; pages:ChapterPage[]; scenes:{id:string;title:string;line:number}[];
 tags:Record<string,number>; resources:{name:string;kind:string;line:number}[];
 obligations:Obligation[]; paragraphCount:number; sourceHash:string;
}
const controlPattern=/⟪k:(\d+)⟫/gu;
export function controlIds(text:string):number[]{return [...text.matchAll(controlPattern)].map(m=>Number(m[1]));}
export function checkControls(text:string,expected:readonly number[]):void {
 const ids=controlIds(text);requireValue(ids.length===expected.length&&ids.every((id,i)=>id===expected[i]),'KS_PO_CONTROL_ORDER');
 requireValue(!text.replace(controlPattern,'').includes('⟪k:'),'KS_PO_CONTROL_SYNTAX');
}
/** Inventory/extraction only. All control instructions remain in a private sidecar.
 * A page candidate is NOT an executable Program and no TJS is evaluated here. */
export function extractChapter(source:string,spec:ChapterSpec):ChapterExtraction {
 const all=tokenize(source,spec.file);requireValue(all.length<=300000,'KS_PO_TOKEN_BUDGET');
 const starts=all.flatMap((t,i)=>t.kind==='label'&&t.name===spec.start?[i]:[]);requireValue(starts.length===1,'KS_PO_ENTRY '+spec.id);
 const begin=starts[0]!;const ends=spec.end?all.flatMap((t,i)=>i>begin&&t.kind==='label'&&t.name===spec.end?[i]:[]):[all.length];requireValue(ends.length===1,'KS_PO_END '+spec.id);const tokens=all.slice(begin,ends[0]);
 const result:ChapterExtraction={spec,pages:[],scenes:[],tags:{},resources:[],obligations:[],paragraphCount:0,sourceHash:hash(source)};
 let scene=spec.start,anchor=spec.start,ordinal=0,parts:string[]=[],controls:TextControl[]=[],origin:SourcePoint|undefined,macro=false;
 let pending:{text:string;controls:TextControl[];source:SourcePoint;scene:string;ending:ChapterPage['ending']}|undefined;
 const seen=new Set<string>(),labelCounts=new Map<string,number>();
 const obligation=(kind:string,t:Token,detail:string)=>result.obligations.push({kind,line:t.source.line,detail});
 const text=(value:string,t:Token)=>{requireValue(!value.includes('⟪k:'),'KS_PO_RESERVED_TEXT');if(value){origin??=t.source;parts.push(value);}};
 const control=(t:Tag)=>{const id=controls.length;controls.push({id,tag:t});parts.push(`⟪k:${id}⟫`);};
 const reset=()=>{parts=[];controls=[];origin=undefined;};
 const save=(name:string,identity:ChapterPage['identity'])=>{requireValue(pending,'KS_PO_PENDING');const context=`${spec.file.replace(/\.ks$/u,'')}:${name}`;requireValue(name&&context.length<=192&&!seen.has(context),'KS_PO_DUPLICATE_LABEL '+context);seen.add(context);result.pages.push({...pending,context,identity,sourceHash:hash(pending.text+'\0'+JSON.stringify(pending.controls.map(c=>[c.tag.name,c.tag.args])))});pending=undefined;};
 const unlabelled=(t:Token)=>{if(pending){obligation('unlabelled-page',t,`${pending.source.line}`);save(`unlabelled:${anchor}:${++ordinal}`,'anchor-sequence');}};
 for(const t of tokens){
  if(t.kind==='script'){obligation('embedded-script',t,'private source only; never parsed as dialogue');continue;}
  if(t.kind==='tag'&&t.name==='macro'){requireValue(!macro,'KS_PO_NESTED_MACRO');macro=true;obligation('macro-definition',t,t.args.name??'<dynamic>');continue;}
  if(macro){if(t.kind==='tag'&&t.name==='endmacro')macro=false;continue;}
  if(t.kind==='label'){
   const occurrence=(labelCounts.get(t.name)??0)+1;labelCounts.set(t.name,occurrence);const canonical=occurrence===1?t.name:`${t.name}:${occurrence}`;if(occurrence>1)obligation('repeated-label',t,canonical);
   if(!pending&&origin){pending={text:parts.join(''),controls,source:origin,scene,ending:'label'};obligation('automatic-text-boundary',t,'source label without [p]');reset();}
   if(pending)save(canonical,'label');
   anchor=canonical;ordinal=0;
   if(t.title||t.name===spec.start){scene=t.name;result.scenes.push({id:scene,title:t.title,line:t.source.line});}
   continue;
  }
  if(t.kind==='text'){unlabelled(t);text(t.text,t);continue;}
  result.tags[t.name]=(result.tags[t.name]??0)+1;
  for(const key of ['storage','graphic','rule','frame','enterse','clickse']){
   const a=t.attributes.filter(a=>a.name===key).at(-1);if(!a)continue;
   if(a.mode==='literal')result.resources.push({name:a.value,kind:t.name+':'+key,line:t.source.line});
   else obligation('dynamic-resource',t,t.name+':'+key);
  }
  if(t.attributes.some(a=>a.mode!=='literal'))obligation('dynamic-argument',t,t.name);
  if(t.name==='c'){
   const a=t.attributes.filter(a=>a.name==='text').at(-1);
   if(a?.mode==='literal'){unlabelled(t);control({...t,args:{},attributes:[]});text(a.value,t);}
   else {obligation('dynamic-text',t,'c.text');control(t);}continue;
  }
  if(t.name==='p'){
   unlabelled(t);result.paragraphCount++;
   if(origin)pending={text:parts.join(''),controls,source:origin,scene,ending:'p'};else obligation('empty-page',t,'no literal text');reset();continue;
  }
  if(t.name==='cm'){
   // Conditions may close between [p] and its following stable label. Keep
   // those instructions in source IR, but never attach them to the next page.
   if(origin){pending={text:parts.join(''),controls,source:origin,scene,ending:'cm'};obligation('text-without-page',t,`${origin.line}`);unlabelled(t);}reset();continue;
  }
  if(t.name==='iscript'||t.name==='endscript')continue;
  if(t.name==='emb')obligation('dynamic-text',t,'emb');
  // Preserve inline controls and leading conditions/formatting, without putting
  // executable/raw KS into the public PO. Every marker binds to this locale.
  if(!pending)control(t);
 }
 requireValue(!macro,'KS_PO_UNCLOSED_MACRO');
 if(pending)unlabelled(tokens.at(-1)!);
 if(origin){pending={text:parts.join(''),controls,source:origin,scene,ending:'end'};unlabelled(tokens.at(-1)!);}
 requireValue(result.pages.length<=20000,'KS_PO_PAGE_BUDGET');return result;
}
export interface CatalogMessage {context:string;id:string;text:string;sourceHash:string;controls:readonly number[];}
function object(x:unknown):asserts x is Record<string,unknown>{requireValue(!!x&&typeof x==='object'&&!Array.isArray(x),'KS_PO_OBJECT');}
function flags(entry:GetTextTranslation):string[]{return (entry.comments?.flag??'').split(',').map(s=>s.trim()).filter(Boolean);}
/** Deterministic merge. Native/default edits are never mistaken for contributor edits. */
export function mergeCatalog(locale:string,messages:readonly CatalogMessage[],previous?:string):{po:string;fuzzy:number;preserved:number;obsolete:number} {
 let old:GetTextTranslations|undefined;if(previous){requireValue(Buffer.byteLength(previous)<=262144,'KS_PO_SIZE');old=po.parse(previous,{validation:true});const lang=Object.entries(old.headers).find(([k])=>k.toLowerCase()==='language')?.[1];requireValue(lang===locale,'KS_PO_LANGUAGE');}
 const data:GetTextTranslations={charset:'UTF-8',headers:{'project-id-version':'morgana-chapters','PO-Revision-Date':Object.entries(old?.headers??{}).find(([k])=>k.toLowerCase()==='po-revision-date')?.[1]??'2026-10-28 00:00+0000','Last-Translator':Object.entries(old?.headers??{}).find(([k])=>k.toLowerCase()==='last-translator')?.[1]??'Community contributors','Language-Team':locale,'MIME-Version':'1.0','content-type':'text/plain; charset=UTF-8','content-transfer-encoding':'8bit',language:locale,'plural-forms':'nplurals=1; plural=0;'},translations:{}};
 let fuzzy=0,preserved=0,obsolete=0;
 for(const m of messages){requireValue(m.context.length>0&&m.context.length<=192&&m.text.length>0&&m.text.length<=16384&&!data.translations[m.context],'KS_PO_MESSAGE');checkControls(m.text,m.controls);
  const candidates=Object.values(old?.translations[m.context]??{});requireValue(candidates.length<=1,'KS_PO_AMBIGUOUS_CONTEXT');const prior=candidates[0];
  let value=m.text,review=false;const currentFlags=prior?flags(prior):[];
  if(prior){requireValue(!prior.msgid_plural&&prior.msgstr.length===1,'KS_PO_PLURAL');const edited=prior.msgstr[0]!;const metadata=prior.comments?.extracted??'';const oldNative=/^native-sha256: ([a-f0-9]{64})$/mu.exec(metadata)?.[1];const oldDefault=/^default-sha256: ([a-f0-9]{64})$/mu.exec(metadata)?.[1];
   requireValue(oldNative&&oldDefault,'KS_PO_MERGE_PROVENANCE');const contributorEdit=hash(edited)!==oldDefault;
   if(contributorEdit){value=edited;preserved++;}
   review=currentFlags.includes('fuzzy')||prior.msgid!==m.id||(contributorEdit&&oldNative!==m.sourceHash)||!!prior.obsolete;
   // A damaged protected marker always needs review, even before source changes.
   try{checkControls(value,m.controls);}catch{review=true;}
  }
  if(review)fuzzy++;
  data.translations[m.context]={[m.id]:{msgctxt:m.context,msgid:m.id,msgstr:[value],comments:{...(prior?.comments??{}),extracted:`Edit msgstr; keep protected ⟪k:N⟫ markers in source order.\nnative-sha256: ${m.sourceHash}\ndefault-sha256: ${hash(m.text)}`,reference:m.context,flag:[...currentFlags.filter(f=>f!=='fuzzy'),...(review?['fuzzy']:[])].join(',')}}};
 }
 for(const [context,group]of Object.entries(old?.translations??{}))if(context&&!data.translations[context]){const entries=Object.values(group);requireValue(entries.length===1,'KS_PO_AMBIGUOUS_CONTEXT');const entry=entries[0]!;data.translations[context]={[entry.msgid]:{...entry,obsolete:true}};obsolete++;}
 const compiled=po.compile(data,{foldLength:100,sort:false}).toString('utf8');requireValue(Buffer.byteLength(compiled)<=262144,'KS_PO_SIZE');return {po:compiled,fuzzy,preserved,obsolete};
}
/** Validate editable files without requiring the private original scripts. */
export function inspectCatalog(source:string,locale:string):{entries:number;fuzzy:number;obsolete:number} {
 requireValue(Buffer.byteLength(source)<=262144,'KS_PO_SIZE');const parsed:unknown=po.parse(source,{validation:true});object(parsed);object(parsed.headers);requireValue(Object.entries(parsed.headers).some(([k,v])=>k.toLowerCase()==='language'&&v===locale),'KS_PO_LANGUAGE');object(parsed.translations);let entries=0,fuzzy=0,obsolete=0;
 for(const [context,group]of Object.entries(parsed.translations)){object(group);if(!context)continue;requireValue(Object.keys(group).length===1,'KS_PO_AMBIGUOUS_CONTEXT');for(const raw of Object.values(group)){object(raw);requireValue(raw.msgctxt===context&&Array.isArray(raw.msgstr)&&raw.msgstr.length===1&&typeof raw.msgstr[0]==='string'&&raw.msgstr[0].length>0&&raw.msgstr[0].length<=16384,'KS_PO_TRANSLATION');if(raw.obsolete){obsolete++;continue;}entries++;object(raw.comments);requireValue(typeof raw.comments.extracted==='string','KS_PO_METADATA');requireValue(/^native-sha256: [a-f0-9]{64}$/mu.test(raw.comments.extracted)&&/^default-sha256: [a-f0-9]{64}$/mu.test(raw.comments.extracted),'KS_PO_METADATA');if(typeof raw.comments.flag==='string'&&raw.comments.flag.split(',').some(f=>f.trim()==='fuzzy'))fuzzy++;}}
 return {entries,fuzzy,obsolete};
}
