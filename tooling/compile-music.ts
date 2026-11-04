import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {ProgramBuilder,compileProgramModuleParts,instruction,stageImage,rulePresentation} from 'galbox-sdk/port-kit';
import {canonicalWireJSON,parseJsonValue} from 'galbox-sdk/protocol';
import {encodeWire} from 'galbox-sdk/wire';
import {inspectResource} from 'galbox-sdk/release';
import {Content} from './content.js';
import {lowerMusic} from './lower-music.js';
import {languages,hash} from './locale.js';
const root='generated/music-full',read=async(p:string)=>new Uint8Array(await readFile(p));
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 const b=new ProgramBuilder({gameId:'fata-music-'+locale,release:'music-build',entry:'music-main'},{foundationMarkers:false}),content=new Content(b,locale),music=await lowerMusic(b,content,locale),parts=music.parts,black=(await content.image('blacksozai')).asset;
 // blacksozai is already in the original music macros and the asset catalog.
 parts.header.entry='main';parts.files.push({uri:'pending.pb',body:{format:'galbox-code',version:1,id:'music-main-wrapper',functions:[{id:'main',entry:'music:background',layout:1,params:[],locals:[],returns:'void',code:[stageImage('music:background','background',black,{x:0,y:0,scaleX:1.6,scaleY:1.2},{z:-1}),instruction('control.call',{at:'music:enter',function:music.entry,args:[]}),instruction('control.end',{at:'music:handoff'})]}]}});
 const assets=[...parts.header.assets,...parts.assetCatalogs.flat()],paths=new Map(assets.map(a=>[a.id,'public/'+a.path]));for(const a of assets)a.path=`assets/shared/${a.kind==='audio'?'audio':'images'}/${a.sha256}${path.extname(a.path)}`;for(const f of parts.files)f.uri=`programs/${locale}/code/${hash(encodeWire('ProgramModule',f.body))}.pb`;parts.header.release='music-'+locale+'-'+hash(canonicalWireJSON(parts.header)+canonicalWireJSON(parts.assetCatalogs)+parts.files.map(f=>hash(encodeWire('ProgramModule',f.body))).join('')).slice(0,20);
  const resources=await Promise.all(assets.map(async a=>inspectResource(a,await read(paths.get(a.id)!),v=>new TextDecoder('utf8',{fatal:true}).decode(v)))),built=await compileProgramModuleParts({compositionVersion:3,parts,resources,series:'music-dev-'+locale,packedDeclarations:true});
  await mkdir(root+'/programs',{recursive:true});await writeFile(`${root}/programs/${locale}.rules.pb`,encodeWire('JsonValue',parseJsonValue(rulePresentation([]))));
 for(const a of assets){await mkdir(path.dirname(root+'/'+a.path),{recursive:true});await copyFile(paths.get(a.id)!,root+'/'+a.path);}for(const f of built.files){await mkdir(path.dirname(root+'/'+f.uri),{recursive:true});await writeFile(root+'/'+f.uri,f.bytes);}await mkdir(root+'/programs',{recursive:true});await writeFile(`${root}/programs/${locale}.modules.pb`,encodeWire('ModuleManifest',built.manifest));await mkdir('artifacts/music',{recursive:true});const {parts:_,...graph}=music,report={locale,release:parts.header.release,functions:built.manifest.functionOrder.length,modules:built.files.length,assets:assets.length,...graph};await writeFile(`artifacts/music/${locale}-compile.json`,JSON.stringify(report,null,2));console.log({locale,release:report.release,files:report.files.length,states:report.states.length,tracks:report.tracks.length,screens:parts.header.ui?.screens.length});
}
