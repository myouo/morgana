import {tokenize,requireValue,strictArgs} from './kag.js';
import type {SourcePoint,Tag} from './kag.js';
export interface StaticLayer {storage:string|null;left:number;top:number;visible:boolean;}
export interface StaticPage {base:StaticLayer;one:StaticLayer;message:StaticLayer;}
export type OpeningEffect=
 |{kind:'transition';from:StaticPage;to:StaticPage;duration:number;method:'crossfade'|'universal';rule:string|null;vague:number;children:boolean;source:SourcePoint}
 |{kind:'wait';duration:number;source:SourcePoint}
 |{kind:'music';storage:string;loop:boolean;source:SourcePoint};
const milliseconds=(s:string|undefined)=>{const n=Number(s);requireValue(Number.isInteger(n)&&n>0&&n<=3600000,'PRESENTATION_DURATION');return n;};
function tagsOnly(body:string,file:string,offset:number){const tokens=tokenize(body,file,offset);requireValue(tokens.every(t=>t.kind==='tag'||t.kind==='label'||t.kind==='text'&&!t.text.trim()),'PRESENTATION_DYNAMIC_CONTENT');const tags=tokens.filter(t=>t.kind==='tag');requireValue(tags.every(t=>t.attributes.every(a=>a.mode==='literal')),'PRESENTATION_DYNAMIC_ATTRIBUTE');return tags;}
export function readTitleExit(source:string){
 const lines=source.split(/\r?\n/u),start=lines.findIndex(l=>l.trim()==='*scenario'),end=lines.findIndex((l,i)=>i>start&&l.startsWith('*'));requireValue(start>=0&&end>start,'TITLE_EXIT');const tags=tagsOnly(lines.slice(start+1,end).join('\n'),'title.ks',start+1);
 const caption=tags.find(t=>t.name==='title');if(caption)strictArgs(caption,['name']);const body=tags.filter(t=>t.name!=='title'),first=body.findIndex(t=>t.name==='trans');requireValue(first===1||first===3,'TITLE_EXIT_PROFILE');
 if(first===1){const clear=body[0]!;strictArgs(clear,['storage','layer','page']);requireValue(clear.name==='image'&&clear.args.storage==='clear'&&clear.args.layer==='1'&&clear.args.page==='back','TITLE_EXIT_PROFILE');}
 else{const [fore,copy,hidden]=body;requireValue(fore&&copy&&hidden,'TITLE_EXIT_PROFILE');strictArgs(fore,['storage','layer','page']);strictArgs(copy,[]);strictArgs(hidden,['storage','layer','page','top','left','visible']);requireValue(fore.name==='image'&&fore.args.layer==='base'&&fore.args.page==='fore'&&fore.args.storage==='オープニング'&&copy.name==='backlay'&&hidden.name==='image'&&hidden.args.layer==='1'&&hidden.args.page==='back'&&hidden.args.visible==='false'&&hidden.args.storage==='タイトルメニュー'&&hidden.args.top==='30'&&hidden.args.left==='0','TITLE_EXIT_PROFILE');}
 const rest=body.slice(first);requireValue(rest.map(t=>t.name).join(',')==='trans,wt,image,image,trans,wt,fadeoutbgm,jump','TITLE_EXIT_PROFILE');const [rule,,fore,back,fade,,music,jump]=rest;requireValue(rule&&fore&&back&&fade&&music&&jump,'TITLE_EXIT_PROFILE');
 strictArgs(rule,['method','rule','time']);strictArgs(fore,['storage','layer','page']);strictArgs(back,['storage','layer','page']);strictArgs(fade,['method','time','stay','children']);strictArgs(music,['time']);strictArgs(jump,['storage','target']);
 requireValue(rule.args.method==='universal'&&rule.args.rule&&fore.args.layer==='base'&&fore.args.page==='fore'&&fore.args.storage==='オープニング'&&back.args.storage==='blacksozai'&&back.args.layer==='base'&&back.args.page==='back'&&fade.args.method==='crossfade'&&fade.args.children==='false'&&jump.args.storage==='scenario.ks'&&jump.args.target==='*start','TITLE_EXIT_PROFILE');
 return {rule:rule.args.rule,ruleMs:milliseconds(rule.args.time),fadeMs:milliseconds(fade.args.time),musicFadeMs:milliseconds(music.args.time),caption:caption?.args.name??null,source:{begin:start+1,end:end+1}};
}
/** Source-led static pages only. This is not a TJS/KAG runtime. */
export function readOpeningPresentation(source:string,menuTop:number){
 const lines=source.split(/\r?\n/u),start=lines.findIndex(l=>l.trim()==='*opening'),end=lines.findIndex((l,i)=>i>start&&/^\[qmenu enabled="?true"?\]/u.test(l.trim()));requireValue(start>=0&&end>start,'PRESENTATION_SLICE');const tags=tagsOnly(lines.slice(start+1,end+1).join('\n'),'scenario.ks',start+1);
 const empty=():StaticLayer=>({storage:null,left:0,top:0,visible:false});let fore:StaticPage={base:{storage:'blacksozai',left:0,top:0,visible:true},one:{storage:'clear',left:0,top:menuTop,visible:true},message:empty()},back=structuredClone(fore),pending:{page:StaticPage;children:boolean}|null=null;
 const effects:OpeningEffect[]=[],setup:Tag[]=[];const layer=(page:StaticPage,id:string|undefined)=>{if(id==='base')return page.base;if(id==='1')return page.one;if(id==='message0')return page.message;throw new Error('PRESENTATION_LAYER '+id);};
 for(const t of tags){if(pending){requireValue(t.name==='wt','PRESENTATION_TRANSITION_WAIT');strictArgs(t,[]);fore=structuredClone(pending.page);if(pending.children)back=structuredClone(fore);else back.base=structuredClone(fore.base);pending=null;continue;}
  const page=t.args.page==='back'?back:fore;
  switch(t.name){
   case 'image':{strictArgs(t,['storage','layer','page','visible','left','top']);requireValue(t.args.storage&&['fore','back'].includes(t.args.page??'fore'),'PRESENTATION_IMAGE');const l=layer(page,t.args.layer);l.storage=t.args.storage;if(t.args.visible!==undefined){requireValue(['true','false'].includes(t.args.visible),'PRESENTATION_VISIBLE');l.visible=t.args.visible==='true';}if(t.args.left!==undefined)l.left=Number(t.args.left);if(t.args.top!==undefined)l.top=Number(t.args.top);break;}
   case 'freeimage':strictArgs(t,['layer']);layer(fore,t.args.layer).storage=null;break;
   case 'backlay':strictArgs(t,[]);back=structuredClone(fore);break;
   case 'trans':{strictArgs(t,['method','time','stay','children','rule','vague']);requireValue(['crossfade','universal'].includes(t.args.method??'universal')&&(!t.args.stay||t.args.stay==='nostay')&&(!t.args.children||['true','false'].includes(t.args.children)),'PRESENTATION_TRANSITION');const children=t.args.children!=='false',to=children?structuredClone(back):{...structuredClone(fore),base:structuredClone(back.base)},method=t.args.method==='crossfade'?'crossfade':'universal';requireValue(method==='crossfade'||t.args.rule,'PRESENTATION_RULE');const vague=Number(t.args.vague??64);requireValue(Number.isInteger(vague)&&vague>=1&&vague<=256,'PRESENTATION_VAGUE');effects.push({kind:'transition',from:structuredClone(fore),to,duration:milliseconds(t.args.time),method,rule:t.args.rule??null,vague,children,source:t.source});pending={page:to,children};break;}
   case 'wait':strictArgs(t,['time']);effects.push({kind:'wait',duration:milliseconds(t.args.time),source:t.source});break;
   case 'playbgm':strictArgs(t,['storage','loop']);requireValue(t.args.storage&&(!t.args.loop||['true','false'].includes(t.args.loop)),'PRESENTATION_MUSIC');effects.push({kind:'music',storage:t.args.storage,loop:t.args.loop!=='false',source:t.source});break;
   case 'layopt':{strictArgs(t,['layer','page','visible']);requireValue(['true','false'].includes(t.args.visible??''),'PRESENTATION_VISIBLE');layer(page,t.args.layer).visible=t.args.visible==='true';break;}
   case 'position':{strictArgs(t,['layer','frame','left','top','width','height','marginl','margint','marginr','marginb']);requireValue(t.args.layer==='message0'&&t.args.frame==='meserei0'&&t.args.width==='800'&&t.args.height==='600','PRESENTATION_MESSAGE');const l=layer(page,t.args.layer);l.storage=t.args.frame;l.left=Number(t.args.left??0);l.top=Number(t.args.top??0);setup.push(t);break;}
   case 'cm':strictArgs(t,[]);break;
   case 'eval':strictArgs(t,['exp']);requireValue(t.args.exp==='sf.showpagebreak = 0 if sf.showpagebreak === void','PRESENTATION_EXPRESSION');setup.push(t);break;
   case 'history':case 'rclick':case 'delay':case 'clickskip':case 'glyph':case 'current':case 'textfade':case 'qmenu':{const keys:Record<string,readonly string[]>={history:['enabled','output'],rclick:['enabled'],delay:['speed'],clickskip:['enabled'],glyph:['left','top'],current:['layer'],textfade:['enabled'],qmenu:['enabled']};strictArgs(t,keys[t.name]!);setup.push(t);break;}
   default:throw new Error(`PRESENTATION_UNSUPPORTED ${t.name}:${t.source.line}`);
  }
 }
 requireValue(!pending&&effects.length>0&&fore.message.visible&&fore.message.storage==='meserei0','PRESENTATION_INCOMPLETE');
 return {effects,setup,finalPage:fore,source:{begin:start+1,end:end+1},deferredControls:['native transition click-skip','original quick/context menus','page glyph and textfade appearance']};
}
