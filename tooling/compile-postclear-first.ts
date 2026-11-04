import {readFile} from 'node:fs/promises';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {decodeWire} from 'galbox-sdk/wire';
import {Content} from './content.js';
import {lowerDoor} from './lower-door.js';
import {chapters} from './chapter-catalog.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
import {writePostclearFragment} from './write-postclear-fragment.js';
const read=async(p:string)=>new Uint8Array(await readFile(p));
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 const baseline=decodeWire('ModuleManifest',await read(`generated/cleared-connected/programs/${locale}.modules.pb`)).header,b=new ProgramBuilder({gameId:'fata-postclear-first-'+locale,release:'postclear-first-build',entry:'main'},{foundationMarkers:false}),content=new Content(b,locale),source=await readFile(`private/text/${locale}/scenario/scenario.ks`,'utf8'),macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8'),fontSize=['jp','zh','ko'].includes(locale)?22:18;
 const first=await lowerDoor(b,content,locale,source,macro,fontSize,{chapter:chapters.find(c=>c.id==='door1')!,catalogRoot:'locales',namespace:'postclear-door1',clearedProfile:true,compactTiming:true,dynamicGeometry:true,proceduralEffects:true,proceduralHeartbeat:true,opacityObject:'text-opacity',functionNamespace:'postclear-first',addressPrefix:'postclear-first'}),interlude=await lowerDoor(b,content,locale,source,macro,fontSize,{chapter:chapters.find(c=>c.id==='interlude1')!,catalogRoot:'locales',namespace:'postclear-interlude',clearedProfile:true,context:first.context,compactTiming:true,dynamicGeometry:true,proceduralEffects:true,proceduralHeartbeat:true,opacityObject:'text-opacity',functionNamespace:'postclear-interlude',addressPrefix:'postclear-interlude'}),bodies=[first,interlude];
 b.function({id:'main',entry:'postclear-first:enter',layout:1,params:[],locals:[],returns:'void',code:[instruction('save.policy',{at:'postclear-first:enter',allow:true}),...first.code,...interlude.code,instruction('control.end',{at:'postclear-first:handoff'})]});requireValue(baseline.textLayout,'POSTCLEAR_LAYOUT');b.textLayout(baseline.textLayout);
 await writePostclearFragment(b,content,locale,'postclear-first',bodies);
}
