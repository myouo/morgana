import {readFile} from 'node:fs/promises';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {string} from 'galbox-sdk/protocol';
import {decodeWire} from 'galbox-sdk/wire';
import {Content} from './content.js';
import {lowerDoor} from './lower-door.js';
import {readDoorIR} from './door-ir.js';
import {chapterProfile} from './chapter-profile.js';
import {doorSegment,sourceChoices,menuIR} from './door-segments.js';
import {forkDoor,prepareDoorChoice} from './door-routes.js';
import {chapters} from './chapter-catalog.js';
import {languages} from './locale.js';
import {localeInfo} from '../src/locales.js';
import {requireValue} from './kag.js';
import {writePostclearFragment} from './write-postclear-fragment.js';
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 const baseline=decodeWire('ModuleManifest',new Uint8Array(await readFile(`generated/cleared-connected/programs/${locale}.modules.pb`))).header,b=new ProgramBuilder({gameId:'fata-postclear-prelude-'+locale,release:'postclear-prelude-build',entry:'main'},{foundationMarkers:false}),content=new Content(b,locale),raw=await readFile(`private/text/${locale}/scenario/scenario.ks`,'utf8'),macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8'),spec=chapters.find(c=>c.id==='prologue')!,fontSize=['jp','zh','ko'].includes(locale)?22:18,ir=chapterProfile(await readDoorIR(raw,localeInfo[locale].html,{chapter:spec,catalogRoot:'locales'}),true),choices=sourceChoices(ir);requireValue(choices.length===1,'POSTCLEAR_PRELUDE_CHOICE');b.global({id:'original.greeting-choice',kind:'string',initial:string('')});
 const common={chapter:spec,catalogRoot:'locales' as const,namespace:'postclear-prologue',clearedProfile:true,specializedIR:true,compactTiming:true,dynamicGeometry:true,proceduralEffects:true,proceduralHeartbeat:true,opacityObject:'text-opacity'};
 const opening=await lowerDoor(b,content,locale,raw,macro,fontSize,{...common,ir:doorSegment(ir,0,choices[0]!.start),functionNamespace:'postclear-prelude-start',addressPrefix:'postclear-prelude-start'}),menu=await prepareDoorChoice(menuIR(ir,choices[0]!.tokens),opening.context,content,locale,fontSize,{minimum:2,maximum:2}),join=ir.tokens.findIndex(t=>t.kind==='label'&&t.name==='共通へ');requireValue(join>choices[0]!.end,'POSTCLEAR_PRELUDE_JOIN');const bodies=[opening];
 for(const [n,dest]of menu.destinations.entries()){
  requireValue(!dest.storage,'POSTCLEAR_PRELUDE_LOCAL_CHOICE');const a=ir.tokens.findIndex(t=>t.kind==='label'&&t.name===dest.target),z=ir.tokens.findIndex((t,k)=>k>a&&t.kind==='tag'&&t.name==='jump'&&t.args.target==='*共通へ');requireValue(a>=0&&z>a,'POSTCLEAR_PRELUDE_ROUTE');const body=await lowerDoor(b,content,locale,raw,macro,fontSize,{...common,ir:doorSegment(ir,a,z),context:forkDoor(menu.context),functionNamespace:'postclear-prelude-option'+n,instructionNamespace:'postclear-prelude-option'+n,addressPrefix:'postclear-prelude-option'+n}),tail=await lowerDoor(b,content,locale,raw,macro,fontSize,{...common,ir:doorSegment(ir,join,ir.tokens.length),context:body.context,functionNamespace:'postclear-prelude-tail'+n,instructionNamespace:'postclear-prelude-tail'+n,addressPrefix:'postclear-prelude-tail'+n});bodies.push(body,tail);b.function({id:'greeting'+n,entry:'postclear-prelude:route'+n,layout:1,params:[],locals:[],returns:'void',code:[instruction('control.jump',{at:'postclear-prelude:route'+n,target:body.code[0]!.at}),...body.code,...tail.code,instruction('control.return',{at:'postclear-prelude:return'+n})]});
 }
 b.function({id:'main',entry:'postclear-prelude:enter',layout:1,params:[],locals:[],returns:'void',code:[instruction('save.policy',{at:'postclear-prelude:enter',allow:true}),...opening.code,...menu.code,instruction('choice',{at:'postclear-prelude:choice',dest:'original.greeting-choice',options:menu.options.map((v,n)=>({id:v.id,text:v.text,target:'postclear-prelude:call'+n}))}),instruction('control.call',{at:'postclear-prelude:call0',function:'greeting0',args:[]}),instruction('control.end',{at:'postclear-prelude:end0'}),instruction('control.call',{at:'postclear-prelude:call1',function:'greeting1',args:[]}),instruction('control.end',{at:'postclear-prelude:end1'})]});requireValue(baseline.textLayout,'POSTCLEAR_PRELUDE_LAYOUT');b.textLayout(baseline.textLayout);await writePostclearFragment(b,content,locale,'postclear-prelude',bodies,{choices:[{at:'postclear-prelude:choice',fontSize,options:menu.options}],autoAt:menu.autosave?['postclear-prelude:choice']:[]});
}
