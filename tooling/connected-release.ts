import {readFile,writeFile,mkdir,cp,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {ProgramBuilder,createModuleProgram,compileProgramModuleParts,expandModuleLeaves,rulePresentation} from 'galbox-sdk/port-kit';
import {canonicalWireJSON,parseJsonValue} from 'galbox-sdk/protocol';
import type {Asset,JsonValue,ProgramModule,ResourceFact,ModuleHeader,Function as ProgramFunction} from 'galbox-sdk/protocol';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {inspectResource} from 'galbox-sdk/release';
import {installModuleFiles} from './install-module-files.js';
import {namespaceFragment} from './fragment-namespace.js';
import {Content} from './content.js';
import {hash} from './locale.js';
import type {Language} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {requireValue} from './kag.js';
import {writeTitleParts} from './split-title-views.js';
import {saveBookmarkParts} from './save-bookmarks.js';
import {copySearchFonts} from './copy-search-fonts.js';
import {poolBitmapUI} from './pool-bitmap-ui.js';
import {readDoorIR} from './door-ir.js';
import {readDoorText} from './door-text.js';
import {specializeOmake} from './omake-constants.js';
import {chapters} from './chapter-catalog.js';

const exec=promisify(execFile),read=async(p:string)=>new Uint8Array(await readFile(p));
function many<T>(values:readonly T[]):[T,...T[]]{const[first,...rest]=values;requireValue(first!==undefined,'CONNECTED_NONEMPTY');return [first,...rest];}
async function title(root:string,locale:Language){
 const meta=decodeWire('JsonValue',await read(`${root}/programs/${locale}.title.pb`));requireValue(meta&&typeof meta==='object'&&!Array.isArray(meta),'CONNECTED_TITLE');
 for(const key of ['history','chapters']){const refs=meta[key+'Parts'];if(!Array.isArray(refs))continue;const rows=meta[key];requireValue(Array.isArray(rows),'CONNECTED_TITLE_ROWS');for(const ref of refs){requireValue(ref&&typeof ref==='object'&&!Array.isArray(ref)&&typeof ref.path==='string'&&typeof ref.sha256==='string','CONNECTED_TITLE_REF');const bytes=await read(root+'/'+ref.path);requireValue(hash(bytes)===ref.sha256,'CONNECTED_TITLE_SHA');const part=decodeWire('JsonValue',bytes);requireValue(Array.isArray(part),'CONNECTED_TITLE_PART');rows.push(...part);}delete meta[key+'Parts'];}
 return meta;
}
async function immutableCopy(source:string,target:string){await mkdir(path.dirname(target),{recursive:true});const bytes=await read(source),old=await read(target).catch(error=>{if(error&&typeof error==='object'&&'code'in error&&error.code==='ENOENT')return undefined;throw error;});if(old)requireValue(hash(old)===hash(bytes),'CONNECTED_IMMUTABLE '+target);else await copyFile(source,target);}

/** Producer-only composition of independently checked standard SDK fragments. */
export async function connectedRelease(from:string,to:string,locale:Language){
 const raw=await read(`${from}/programs/${locale}.modules.pb`),manifest=decodeWire('ModuleManifest',raw),prior=createModuleProgram(manifest),files=await Promise.all(manifest.modules.map(async m=>({uri:m.uri,body:decodeWire('ProgramModule',await read(from+'/'+m.uri))})));installModuleFiles(prior,files.map(f=>f.body));
 const meta=await title(from,locale),header=manifest.header,b=new ProgramBuilder({gameId:header.gameId,release:'connected-fragments',entry:'main'},{foundationMarkers:false}),content=new Content(b,locale,prior.catalog(),from),assets=new Map(prior.catalog().filter(a=>a.kind!=='font').map(a=>[a.id,a])),facts=new Map(prior.resources().map(r=>[r.id,r])),sources=new Map(prior.catalog().map(a=>[a.id,from+'/'+a.path]));
 // Only immutable directories and this locale's code are copied. Other locale
 // producers may be finishing their own manifests in the source candidate.
 await mkdir(to,{recursive:true});for(const dir of ['assets/shared',`assets/locales/${localeInfo[locale].html}`,'compat','text',`programs/${locale}`])await cp(from+'/'+dir,to+'/'+dir,{recursive:true,force:false,errorOnExist:false});
 const functions=()=>files.flatMap(f=>f.body.functions);
 function mergeHeader(other:ModuleHeader){
  const foundation=new Set(['adv','stage.linear','audio.wav','tasks.all','profile']);header.capabilities=[...new Set([...header.capabilities,...other.capabilities.filter(c=>!foundation.has(c))])];
  const globals=new Map(header.globals.map(g=>[g.id,g]));for(const g of other.globals){const old=globals.get(g.id);requireValue(!old||canonicalWireJSON(old)===canonicalWireJSON(g),'CONNECTED_GLOBAL '+g.id);globals.set(g.id,g);}header.globals=[...globals.values()];
  const styles=new Map((header.textStyles??[]).map(s=>[s.id,s]));for(const s of other.textStyles??[]){const old=styles.get(s.id);requireValue(!old||canonicalWireJSON(old)===canonicalWireJSON(s),'CONNECTED_STYLE '+s.id);styles.set(s.id,s);}if(styles.size)header.textStyles=many([...styles.values()]);
  for(const key of ['bgmBuffers','sfxBuffers']as const){const rows=[...new Set([...(header[key]??[]),...(other[key]??[])])];if(rows.length)header[key]=many(rows);}
  if(other.ui){requireValue(header.ui,'CONNECTED_UI');const screens=new Map(header.ui.screens.map(s=>[s.id,s]));for(const s of other.ui.screens){const old=screens.get(s.id);requireValue(!old||canonicalWireJSON(old)===canonicalWireJSON(s),'CONNECTED_SCREEN '+s.id);screens.set(s.id,s);}header.ui.screens=many([...screens.values()]);}
  requireValue(!other.extras,'CONNECTED_FRAGMENT_EXTRAS_REQUIRE_EXPLICIT_LINK');
 }
 async function mergePresentation(input:JsonValue|undefined,root:string){
  if(!input)return;requireValue(typeof input==='object'&&!Array.isArray(input)&&Array.isArray(input.assets)&&Array.isArray(input.resources),'CONNECTED_PRESENTATION');const old=meta.presentationAssets;requireValue(old&&typeof old==='object'&&!Array.isArray(old)&&Array.isArray(old.assets)&&Array.isArray(old.resources),'CONNECTED_BASE_PRESENTATION');
  for(const a of input.assets){requireValue(a&&typeof a==='object'&&!Array.isArray(a)&&typeof a.id==='string'&&typeof a.path==='string'&&typeof a.sha256==='string','CONNECTED_VISUAL');const previous=old.assets.find(v=>v&&typeof v==='object'&&!Array.isArray(v)&&v.id===a.id);if(previous){requireValue(typeof previous==='object'&&!Array.isArray(previous)&&previous.sha256===a.sha256&&previous.kind===a.kind&&previous.mime===a.mime,'CONNECTED_VISUAL_ID '+a.id);continue;}const source=root+'/'+a.path;a.path=`assets/shared/images/${a.sha256}${path.extname(a.path)}`;await immutableCopy(source,to+'/'+a.path);old.assets.push(a);}
  for(const r of input.resources){requireValue(r&&typeof r==='object'&&!Array.isArray(r)&&typeof r.id==='string','CONNECTED_VISUAL_FACT');const previous=old.resources.find(v=>v&&typeof v==='object'&&!Array.isArray(v)&&v.id===r.id);requireValue(!previous||canonicalWireJSON(previous)===canonicalWireJSON(r),'CONNECTED_VISUAL_FACT_ID');if(!previous)old.resources.push(r);}
 }
 function mergeRules(input:JsonValue|undefined){if(!input)return;requireValue(typeof input==='object'&&!Array.isArray(input)&&Array.isArray(input.images),'CONNECTED_RULES');const old=meta.rulePresentation;requireValue(old&&typeof old==='object'&&!Array.isArray(old)&&Array.isArray(old.images),'CONNECTED_BASE_RULES');for(const row of input.images)if(!old.images.some(v=>canonicalWireJSON(v)===canonicalWireJSON(row)))old.images.push(row);}
 async function addFragment(root:string,prefix:string,kind?:'bitmap'|'omake',namespaceUI=false){
  const donorManifest=decodeWire('ModuleManifest',await read(`${root}/programs/${locale}.modules.pb`)),donor=createModuleProgram(donorManifest),donorFiles=await Promise.all(donorManifest.modules.map(async m=>({uri:m.uri,body:decodeWire('ProgramModule',await read(root+'/'+m.uri))})));installModuleFiles(donor,donorFiles.map(f=>f.body));const donorMeta:{[key:string]:JsonValue}=kind?{history:[],chapters:[],rulePresentation:decodeWire('JsonValue',await read(`${root}/programs/${locale}.rules.pb`))}:await title(root,locale);
  if(kind==='bitmap')requireValue(!donorManifest.header.textLayout&&donorFiles.every(f=>f.body.functions.every(fn=>fn.code.every(i=>i.op!=='text.rich'&&i.op!=='text.page'))),'CONNECTED_BITMAP_TEXT');
  if(kind==='omake'){
   const raw=await readFile(`private/text/${locale}/scenario/omake.ks`,'utf8'),macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8'),ir=specializeOmake(await readDoorIR(raw,localeInfo[locale].html,{chapter:chapters.find(c=>c.id==='omake')!,catalogRoot:'locales'})).ir,story=readDoorText(ir,macro,['jp','zh','ko'].includes(locale)?22:18,{namespace:'omake',extended:true,historyPolicy:true}),history=new Map(story.nodes.flatMap(n=>n.kind==='text'?[[n.paragraph.id,{id:n.paragraph.id,key:n.speaker.key,centered:n.historyCentered}]as const]:[]));donorMeta.history=Array.from({length:Math.ceil(history.size/256)},(_,n)=>[...history.values()].slice(n*256,n*256+256));
   const names=ir.tokens.flatMap(t=>t.kind==='tag'&&t.name==='title'?[t.args.name??'']:[]);requireValue(names.length===1,'CONNECTED_OMAKE_TITLE');const addresses=donorFiles.flatMap(f=>f.body.functions.flatMap(fn=>fn.code.flatMap(i=>i.op==='text.rich'?[i.at]:[])));donorMeta.chapters=Array.from({length:Math.ceil(addresses.length/256)},(_,n)=>({title:names[0]!,addresses:addresses.slice(n*256,n*256+256)}));
  }
  const expanded=expandModuleLeaves({header:donorManifest.header,files:donorFiles,assetCatalogs:donorManifest.assetCatalogs?.map(c=>c.assets)??[]},{compositionVersion:3}),linked=namespaceFragment(expanded.parts.files.flatMap(f=>f.body.functions),prefix);
  if(namespaceUI&&donorManifest.header.ui){const screens=new Set(donorManifest.header.ui.screens.map(s=>s.id));for(const fn of linked.functions)for(const i of fn.code)if('screen'in i&&typeof i.screen==='string'&&screens.has(i.screen))i.screen=prefix+i.screen;for(const s of donorManifest.header.ui.screens)s.id=prefix+s.id;}
  const known=new Set(functions().map(f=>f.id));for(const f of linked.functions)requireValue(!known.has(f.id),'CONNECTED_FUNCTION '+f.id);
  for(const file of expanded.parts.files){const ids=new Set(file.body.functions.map(f=>prefix+f.id));files.push({uri:'pending.pb',body:{...file.body,id:prefix.replace(/\//gu,'-')+file.body.id,functions:many(linked.functions.filter(f=>ids.has(f.id)))}});}
  mergeHeader(donorManifest.header);
  for(const a of donor.catalog()){if(a.kind==='font')continue;const old=assets.get(a.id);requireValue(!old||old.sha256===a.sha256&&old.kind===a.kind&&old.playback===a.playback,'CONNECTED_ASSET '+a.id);if(!old){const source=root+'/'+a.path;a.path=`assets/shared/${a.kind==='audio'?'audio':'images'}/${a.sha256}${path.extname(a.path)}`;assets.set(a.id,a);sources.set(a.id,source);}}
  for(const r of donor.resources())if(!facts.has(r.id))facts.set(r.id,r);
  const history=new Map((Array.isArray(meta.history)?meta.history.flat():[]).flatMap(r=>r&&typeof r==='object'&&!Array.isArray(r)&&typeof r.id==='string'?[[r.id,r]as const]:[]));for(const r of Array.isArray(donorMeta.history)?donorMeta.history.flat():[])if(r&&typeof r==='object'&&!Array.isArray(r)&&typeof r.id==='string'){const old=history.get(r.id);requireValue(!old||canonicalWireJSON(old)===canonicalWireJSON(r),'CONNECTED_HISTORY');history.set(r.id,r);}meta.history=Array.from({length:Math.ceil(history.size/256)},(_,n)=>[...history.values()].slice(n*256,n*256+256));
  meta.chapters=[...Array.isArray(meta.chapters)?meta.chapters:[],...(Array.isArray(donorMeta.chapters)?donorMeta.chapters.map(r=>{requireValue(r&&typeof r==='object'&&!Array.isArray(r)&&Array.isArray(r.addresses),'CONNECTED_CHAPTER');return {...r,addresses:r.addresses.map(at=>{requireValue(typeof at==='string'&&linked.addresses.has(at),'CONNECTED_CHAPTER_ADDRESS');return linked.addresses.get(at)!;})};}):[])];
  for(const key of ['choices','autoAt','textAutoAt','uiAutoAt']){const rows=donorMeta[key];if(!Array.isArray(rows)||!rows.length)continue;meta[key]=[...Array.isArray(meta[key])?meta[key]:[],...rows.map(row=>{if(typeof row==='string'){requireValue(linked.addresses.has(row),'CONNECTED_POINT');return linked.addresses.get(row)!;}requireValue(key==='choices'&&row&&typeof row==='object'&&!Array.isArray(row)&&typeof row.at==='string'&&linked.addresses.has(row.at),'CONNECTED_CHOICE');return {...row,at:linked.addresses.get(row.at)!};})];}
  await mergePresentation(donorMeta.presentationAssets,root);mergeRules(donorMeta.rulePresentation);
  return {linked,release:donor.release};
 }
 async function replaceFragment(root:string,prefix:string){
  const previous=functions().filter(f=>f.id.startsWith(prefix));requireValue(previous.length>0,'CONNECTED_REPLACE_EMPTY');
  for(let n=files.length-1;n>=0;n--){const file=files[n]!,kept=file.body.functions.filter(f=>!f.id.startsWith(prefix));if(!kept.length)files.splice(n,1);else file.body.functions=many(kept);}
  if(Array.isArray(meta.chapters))meta.chapters=meta.chapters.flatMap(row=>{requireValue(row&&typeof row==='object'&&!Array.isArray(row)&&Array.isArray(row.addresses),'CONNECTED_REPLACE_CHAPTER');const addresses=row.addresses.filter(at=>{requireValue(typeof at==='string','CONNECTED_REPLACE_ADDRESS');return !at.startsWith(prefix);});return addresses.length?[{...row,addresses}]:[];});
  // The replacement must keep authored addresses; caller verifies the exact
  // supported code substitutions before finishing this candidate.
  const linked=await addFragment(root,prefix);return {...linked,previous};
 }
 async function finish(name:string,bonusSaveSpecs:readonly string[]=[],pool=false){
  const parts=b.parts({compositionVersion:3}),known=new Map(functions().map(f=>[f.id,f]));
  for(const file of parts.files){const added=[];for(const f of file.body.functions){const old=known.get(f.id);requireValue(!old||canonicalWireJSON(old)===canonicalWireJSON(f),'CONNECTED_BUILDER_FUNCTION '+f.id);if(!old){added.push(f);known.set(f.id,f);}}if(added.length)files.push({uri:'pending.pb',body:{...file.body,id:name+'-support-'+file.body.id,functions:many(added)}});}
  requireValue(new Set(files.map(f=>f.body.id)).size===files.length,'CONNECTED_MODULE_IDS');
  mergeHeader(parts.header);
  if(pool)poolBitmapUI(header,files,[{id:'native-menu-pooled',prefix:'source-menu-'},{id:'native-gallery-pooled',prefix:'gallery-'},{id:'native-omake-pooled',prefix:'omake-menu'}]);
  for(const a of [...parts.header.assets,...parts.assetCatalogs.flat()]){const old=assets.get(a.id);requireValue(!old||old.sha256===a.sha256&&old.kind===a.kind&&old.playback===a.playback,'CONNECTED_BUILDER_ASSET '+a.id);if(!old){const file='public/'+a.path,bytes=await read(file);a.path=`assets/shared/${a.kind==='audio'?'audio':'images'}/${a.sha256}${path.extname(a.path)}`;assets.set(a.id,a);sources.set(a.id,file);facts.set(a.id,inspectResource(a,bytes,v=>new TextDecoder('utf8',{fatal:true}).decode(v)));}}
  const chars=functions().flatMap(f=>f.code.flatMap(i=>i.op==='text.rich'?[...(i.speaker.op==='literal'?[i.speaker.value]:[]),...i.runs.flatMap(r=>(r.kind==='text'||r.kind==='ruby')&&r.content.op==='literal'?[r.content.value,...(r.kind==='ruby'&&r.reading.op==='literal'?[r.reading.value]:[])]:[])]:i.op==='text.page'?[i.speaker,i.content]:[])).join('\n'),charFile=`private/generated/${name}-${locale}-chars.txt`,fontFile=`private/generated/${name}-${locale}.ttf`,fontName=locale==='ko'?'NotoSerifCJKkr-SemiBold.ttf':['jp','zh'].includes(locale)?'NotoSansCJKsc-Medium.ttf':locale==='ru'?'Merriweather-Regular.ttf':'LibreBaskerville-Regular.ttf';
  await writeFile(charFile,chars);await exec('private/.venv/bin/python',['-m','fontTools.subset',path.join(process.env.FATA_SOURCE??'/home/myo/.steam/steam/steamapps/common/The House in Fata Morgana','fonts',fontName),`--text-file=${charFile}`,`--output-file=${fontFile}`,'--layout-features=*','--notdef-glyph','--notdef-outline']);await exec('private/.venv/bin/python',['tooling/check-font.py',fontFile,charFile]);const font=await read(fontFile),fontAsset:Asset={id:'opening-font',kind:'font',path:`assets/locales/${localeInfo[locale].html}/fonts/${hash(font)}.ttf`,mime:'font/ttf',sha256:hash(font)};assets.set(fontAsset.id,fontAsset);sources.set(fontAsset.id,fontFile);facts.set(fontAsset.id,inspectResource(fontAsset,font,v=>new TextDecoder('utf8',{fatal:true}).decode(v)));
  const all=[...assets.values()];await mergePresentation(parseJsonValue(await content.presentationAssets({assets:all})),'public');mergeRules(parseJsonValue(rulePresentation([...content.ruleMasks].map(([source,mask])=>({source:{id:source,kind:'image'},mask:{id:mask,kind:'image'}})))));
  header.assets=all.slice(0,256);const catalogs=[];for(let n=256;n<all.length;n+=512)catalogs.push(all.slice(n,n+512));for(const file of files)file.uri=`programs/${locale}/code/${hash(encodeWire('ProgramModule',file.body))}.pb`;header.release=name+'-'+locale+'-'+hash(canonicalWireJSON(header)+canonicalWireJSON(catalogs)+files.map(f=>hash(encodeWire('ProgramModule',f.body))).join('')).slice(0,20);
  const points=[...manifest.points?.map(p=>p.at)??[],...(Array.isArray(meta.autoAt)?meta.autoAt.filter((v):v is string=>typeof v==='string'):[])],built=await compileProgramModuleParts({compositionVersion:3,parts:{header,files,assetCatalogs:catalogs},resources:all.map(a=>{const fact=facts.get(a.id);requireValue(fact,'CONNECTED_FACT '+a.id);return fact;}),series:manifest.release.series,points:[...new Set(points)],packedDeclarations:true,inheritExtrasCompatibility:true,extrasSources:[prior]});
  const checked=createModuleProgram(built.manifest);installModuleFiles(checked,built.files.map(f=>f.body));for(const a of all)await immutableCopy(sources.get(a.id)!,to+'/'+a.path);for(const file of built.files){await mkdir(path.dirname(to+'/'+file.uri),{recursive:true});await writeFile(to+'/'+file.uri,file.bytes);}
  requireValue(Array.isArray(meta.moduleSources)&&meta.moduleMigration&&typeof meta.moduleMigration==='object'&&!Array.isArray(meta.moduleMigration),'CONNECTED_COMPAT');const sha=hash(raw);await immutableCopy(`${from}/programs/${locale}.modules.pb`,to+`/compat/modules/${sha}.pb`);meta.moduleSources.push({release:prior.release,sha256:sha,path:`compat/modules/${sha}.pb`,migration:'search',searchBase:'frames',leafPlan:meta.moduleMigration.leafPlan!,requiredFunctions:['main']});
  if(bonusSaveSpecs.length)meta.saveNameParts=await saveBookmarkParts(locale,to,9,bonusSaveSpecs);
  await writeTitleParts(meta,to);await mkdir(to+'/programs',{recursive:true});await writeFile(`${to}/programs/${locale}.modules.pb`,encodeWire('ModuleManifest',built.manifest));await writeFile(`${to}/programs/${locale}.title.pb`,encodeWire('JsonValue',meta));
  for(const file of [`text/${locale}.ui.pb`,'text/locales.pb'])await copyFile(from+'/'+file,to+'/'+file);await copySearchFonts(to,from,locale);
  return {release:header.release,source:prior.release,functions:built.manifest.functionOrder.length,modules:built.files.length,assets:all.length};
 }
 return {manifest,header,meta,b,content,files,functions,addFragment,replaceFragment,finish};
}
