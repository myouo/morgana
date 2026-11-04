import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {ProgramBuilder,compileProgramModuleParts,stageImage,instruction,rulePresentation} from 'galbox-sdk/port-kit';
import {bool,string,canonicalWireJSON,parseJsonValue} from 'galbox-sdk/protocol';
import {decodeWire,encodeWire} from 'galbox-sdk/wire';
import {inspectResource} from 'galbox-sdk/release';
import {Content} from './content.js';
import {lowerSearch2} from './lower-search2.js';
import {secondSearchFlags} from './search-conditions.js';
import {hash,languages} from './locale.js';
import type {Language} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {requireValue} from './kag.js';
const exec=promisify(execFile),root='generated/search2-full',base='generated/sixth-public';
export async function compileSearch2Fragment(locale:Language){
 const read=async(p:string)=>new Uint8Array(await readFile(p)),baseline=decodeWire('ModuleManifest',await read(`${base}/programs/${locale}.modules.pb`)).header,b=new ProgramBuilder({gameId:'fata-full-search2-'+locale,title:baseline.title,release:'search2-build',entry:'main'}),content=new Content(b,locale),source=await readFile(`private/text/${locale}/scenario/search2.ks`,'utf8'),macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8'),fontSize=['jp','zh','ko'].includes(locale)?22:18;
 for(const id of secondSearchFlags)b.global({id:'original.'+id,kind:'bool',initial:bool(false)});b.global({id:'original.search-choice',kind:'string',initial:string('')}).global({id:'original.return-title',kind:'bool',initial:bool(false)});
 await mkdir('private/generated',{recursive:true});await mkdir('public/assets',{recursive:true});const lowered=await lowerSearch2(b,content,locale,source,macro,fontSize),black=await content.image('blacksozai');
 b.function({id:'main',entry:'initialize',layout:1,params:[],locals:[],returns:'void',code:[stageImage('initialize','background',black.asset,{x:0,y:0,scaleX:1.6,scaleY:1.2}),instruction('control.call',{at:'search2:enter',function:lowered.entry,args:[]}),instruction('control.end',{at:'search2:handoff'})]});
 requireValue(baseline.textLayout,'SEARCH2_TEXT_LAYOUT');b.textLayout(baseline.textLayout);
 const text=lowered.bodies.flatMap(body=>body.story.nodes).flatMap(n=>n.kind==='text'?[n.speaker.text,...n.atoms.flatMap(a=>a.kind==='text'?[a.text]:[])]:[]).join('\n'),chars=`private/generated/search2-${locale}-chars.txt`,fontFile=`private/generated/search2-${locale}.ttf`,fontName=locale==='ko'?'NotoSerifCJKkr-SemiBold.ttf':['jp','zh'].includes(locale)?'NotoSansCJKsc-Medium.ttf':locale==='ru'?'Merriweather-Regular.ttf':'LibreBaskerville-Regular.ttf';
 await writeFile(chars,text);await exec('private/.venv/bin/python',['-m','fontTools.subset',path.join(process.env.FATA_SOURCE??'/home/myo/.steam/steam/steamapps/common/The House in Fata Morgana','fonts',fontName),`--text-file=${chars}`,`--output-file=${fontFile}`,'--layout-features=*','--notdef-glyph','--notdef-outline']);await exec('private/.venv/bin/python',['tooling/check-font.py',fontFile,chars]);const font=await read(fontFile),fontPath=`assets/${hash(font)}.ttf`;await writeFile('public/'+fontPath,font);b.asset('font',{id:'opening-font',path:fontPath,mime:'font/ttf',sha256:hash(font)});
 const parts=b.parts(),assets=[...parts.header.assets,...parts.assetCatalogs.flat()],oldPaths=new Map(assets.map(a=>[a.id,a.path]));for(const a of assets)a.path=`assets/locales/${localeInfo[locale].html}/${a.kind==='font'?'fonts':a.kind==='audio'?'audio':'images'}/${a.sha256}${path.extname(a.path)}`;
 for(const file of parts.files)file.uri=`programs/${locale}/code/${hash(encodeWire('ProgramModule',file.body))}.pb`;
 parts.header.release='search2-'+locale+'-'+hash(canonicalWireJSON(parts.header)+canonicalWireJSON(parts.assetCatalogs)+parts.files.map(f=>hash(encodeWire('ProgramModule',f.body))).join('')).slice(0,20);
 const resources=await Promise.all(assets.map(async a=>inspectResource(a,await read('public/'+oldPaths.get(a.id)),v=>new TextDecoder('utf-8',{fatal:true}).decode(v)))),points=lowered.autoAt,built=await compileProgramModuleParts({parts,series:'search2-dev-'+locale,resources,points});
 for(const a of assets){await mkdir(path.dirname(root+'/'+a.path),{recursive:true});await copyFile('public/'+oldPaths.get(a.id),root+'/'+a.path);}for(const file of built.files){await mkdir(path.dirname(root+'/'+file.uri),{recursive:true});await writeFile(root+'/'+file.uri,file.bytes);}await mkdir(root+'/programs',{recursive:true});await writeFile(`${root}/programs/${locale}.modules.pb`,encodeWire('ModuleManifest',built.manifest));
 const rule=rulePresentation([...content.ruleMasks].map(([source,mask])=>({source:{id:source,kind:'image'},mask:{id:mask,kind:'image'}}))),report={locale,release:parts.header.release,functions:built.manifest.functionOrder.length,modules:built.files.length,assets:assets.length,menus:lowered.menus.map(m=>({id:m.id,buttons:m.buttons.map(v=>({id:v.ref.id,target:v.target})),autosave:m.autosave})),issues:lowered.bodies.flatMap(v=>v.sourceIssues),boundaries:['scenario7.ks','first.ks']};await mkdir('artifacts/search2',{recursive:true});await writeFile(`artifacts/search2/${locale}-compile.json`,JSON.stringify(report,null,2));await writeFile(`${root}/programs/${locale}.rules.pb`,encodeWire('JsonValue',parseJsonValue(rule)));console.log(report);return {built,lowered,parts};
}
if(process.argv[1]?.endsWith('/compile-search2-fragment.ts')){const wanted=process.argv[2]??'zh';requireValue(wanted==='all'||languages.some(l=>l===wanted),'SEARCH2_LOCALE');for(const locale of languages.filter(l=>wanted==='all'||l===wanted))await compileSearch2Fragment(locale);}
