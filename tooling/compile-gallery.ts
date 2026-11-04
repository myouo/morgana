import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import path from 'node:path';
import {ProgramBuilder,compileProgramModuleParts,instruction,stageImage,rulePresentation} from 'galbox-sdk/port-kit';
import {canonicalWireJSON,parseJsonValue} from 'galbox-sdk/protocol';
import {encodeWire} from 'galbox-sdk/wire';
import {inspectResource} from 'galbox-sdk/release';
import {Content} from './content.js';
import {lowerGallery} from './lower-gallery.js';
import {hash,languages} from './locale.js';
import {requireValue} from './kag.js';

const root='generated/gallery-full',read=async(p:string)=>new Uint8Array(await readFile(p));
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 const b=new ProgramBuilder({gameId:'fata-gallery-'+locale,release:'gallery-build',entry:'main'},{foundationMarkers:false}),content=new Content(b,locale),gallery=await lowerGallery(b,content,locale),black=(await content.image('blacksozai')).asset;
 b.function({id:'main',entry:'gallery:initialize-background',layout:1,params:[],locals:[],returns:'void',code:[stageImage('gallery:initialize-background','background',black,{x:0,y:0,scaleX:1.6,scaleY:1.2},{z:-1}),instruction('control.call',{at:'gallery:enter',function:gallery.entry,args:[]}),instruction('control.end',{at:'gallery:handoff'})]});
 const parts=b.parts({compositionVersion:3}),assets=[...parts.header.assets,...parts.assetCatalogs.flat()],paths=new Map(assets.map(a=>[a.id,'public/'+a.path]));for(const a of assets)a.path=`assets/shared/${a.kind==='audio'?'audio':'images'}/${a.sha256}${path.extname(a.path)}`;
 for(const f of parts.files)f.uri=`programs/${locale}/code/${hash(encodeWire('ProgramModule',f.body))}.pb`;parts.header.release='gallery-'+locale+'-'+hash(canonicalWireJSON(parts.header)+canonicalWireJSON(parts.assetCatalogs)+parts.files.map(f=>hash(encodeWire('ProgramModule',f.body))).join('')).slice(0,20);
 const resources=await Promise.all(assets.map(async a=>inspectResource(a,await read(paths.get(a.id)!),v=>new TextDecoder('utf8',{fatal:true}).decode(v)))),built=await compileProgramModuleParts({compositionVersion:3,parts,resources,series:'gallery-dev-'+locale,packedDeclarations:true});
 for(const a of assets){await mkdir(path.dirname(root+'/'+a.path),{recursive:true});await copyFile(paths.get(a.id)!,root+'/'+a.path);}for(const f of built.files){await mkdir(path.dirname(root+'/'+f.uri),{recursive:true});await writeFile(root+'/'+f.uri,f.bytes);}await mkdir(root+'/programs',{recursive:true});await writeFile(`${root}/programs/${locale}.modules.pb`,encodeWire('ModuleManifest',built.manifest));
 const rules=rulePresentation([...content.ruleMasks].map(([source,mask])=>({source:{id:source,kind:'image'},mask:{id:mask,kind:'image'}})));await writeFile(`${root}/programs/${locale}.rules.pb`,encodeWire('JsonValue',parseJsonValue(rules)));await mkdir('artifacts/gallery',{recursive:true});const report={locale,release:parts.header.release,functions:built.manifest.functionOrder.length,modules:built.files.length,assets:assets.length,...gallery,entry:gallery.entry};await writeFile(`artifacts/gallery/${locale}-compile.json`,JSON.stringify(report,null,2));console.log({locale,release:report.release,functions:report.functions,blocks:report.blocks.length,thumbnails:report.thumbnails,hooks:report.hooks,issues:report.issues.length});
}
