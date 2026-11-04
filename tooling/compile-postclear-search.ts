import {readFile} from 'node:fs/promises';
import {ProgramBuilder,instruction} from 'galbox-sdk/port-kit';
import {bool,i32,string} from 'galbox-sdk/protocol';
import {decodeWire} from 'galbox-sdk/wire';
import {Content} from './content.js';
import {lowerSearch} from './lower-search.js';
import {searchFlags} from './search-conditions.js';
import {languages} from './locale.js';
import {writePostclearFragment} from './write-postclear-fragment.js';
import {requireValue} from './kag.js';
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 const baseline=decodeWire('ModuleManifest',new Uint8Array(await readFile(`generated/cleared-connected/programs/${locale}.modules.pb`))).header,b=new ProgramBuilder({gameId:'fata-postclear-search-'+locale,release:'postclear-search-build',entry:'main'},{foundationMarkers:false}),content=new Content(b,locale),raw=await readFile(`private/text/${locale}/scenario/search.ks`,'utf8'),macro=await readFile(`private/text/${locale}/scenario/macro.ks`,'utf8');
 for(const key of searchFlags)b.global({id:'original.'+key,kind:'bool',initial:bool(false)});b.global({id:'original.maid-count',kind:'i32',initial:i32(0)}).global({id:'original.search-choice',kind:'string',initial:string('')});const search=await lowerSearch(b,content,locale,raw,macro,['jp','zh','ko'].includes(locale)?22:18,undefined,true);
 b.function({id:'main',entry:'postclear-search:enter',layout:1,params:[],locals:[],returns:'void',code:[instruction('save.policy',{at:'postclear-search:enter',allow:true}),instruction('control.call',{at:'postclear-search:body',function:search.entry,args:[]}),instruction('control.end',{at:'postclear-search:handoff'})]});requireValue(baseline.textLayout,'POSTCLEAR_SEARCH_LAYOUT');b.textLayout(baseline.textLayout);await writePostclearFragment(b,content,locale,'postclear-search',search.bodies,{autoAt:search.menus.filter(m=>m.autosave).map(m=>m.id+':wait'),uiAutoAt:search.menus.filter(m=>m.autosave).map(m=>m.id+':wait')});
}
