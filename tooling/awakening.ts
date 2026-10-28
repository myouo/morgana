import {tokenize,strictArgs,literalArg,requireValue} from './kag.js';
import type {Token} from './kag.js';
import {richText as R} from 'galbox-sdk/port-kit';
import type {RichTextSourceRun,TextStyle} from 'galbox-sdk/protocol';
import type {OpeningPage} from './opening.js';
export interface AwakeningPage extends OpeningPage {mode:'narration'|'whisper';}
export interface Awakening {pages:AwakeningPage[];title:string;image:string;duration:number;startLine:number;endLine:number;profile:'fresh';}
/** This published slice explicitly targets a new original profile (sf.fataend=0). No TJS is executed. */
function fresh(tokens:Token[]):Token[]{
 const out:Token[]=[],stack:{parent:boolean;condition:boolean;otherwise:boolean}[]=[];let active=true;
 for(const t of tokens){if(t.kind==='tag'&&t.name==='if'){strictArgs(t,['exp']);const expr=literalArg(t,'exp').replace(/\s/gu,'');requireValue(expr==='sf.fataend==1'||expr==='sf.fataend!=1','AWAKENING_CONDITION');const condition=expr==='sf.fataend!=1';stack.push({parent:active,condition,otherwise:false});active=active&&condition;continue;}
  if(t.kind==='tag'&&t.name==='else'){strictArgs(t,[]);const top=stack.at(-1);requireValue(top&&!top.otherwise,'AWAKENING_ELSE');top.otherwise=true;active=top.parent&&!top.condition;continue;}
  if(t.kind==='tag'&&t.name==='endif'){strictArgs(t,[]);const top=stack.pop();requireValue(top,'AWAKENING_ENDIF');active=top.parent;continue;}
  if(active)out.push(t);
 }requireValue(stack.length===0,'AWAKENING_UNCLOSED_IF');return out;
}
export function readAwakening(source:string,macro:string,file='scenario/scenario.ks',fontSize=18):Awakening {
 const lines=source.split(/\r?\n/u),begin=lines.findIndex(l=>l.startsWith('*zero2|')),end=lines.findIndex((l,i)=>i>begin&&/^\[playse\s/u.test(l.trim()));requireValue(begin>0&&end>begin,'AWAKENING_SLICE');
 const prefix=tokenize(lines.slice(Math.max(0,begin-7),begin).join('\n'),file),transition=prefix.find(t=>t.kind==='tag'&&t.name==='trans'),image=prefix.find(t=>t.kind==='tag'&&t.name==='image'&&t.args.page==='back');requireValue(transition?.kind==='tag'&&image?.kind==='tag'&&transition.args.method==='crossfade'&&transition.args.time==='4000'&&transition.args.children==='false','AWAKENING_TRANSITION');strictArgs(transition,['method','time','children','stay']);strictArgs(image,['storage','layer','page']);requireValue(image.args.layer==='base','AWAKENING_IMAGE');
 const macroTokens=tokenize(macro,'scenario/macro.ks'),w=macroTokens.findIndex(t=>t.kind==='tag'&&t.name==='macro'&&t.args.name==='w'),wc=macroTokens[w+1],close=macroTokens[w+2];requireValue(w>=0&&wc?.kind==='tag'&&wc.name==='wc'&&['8','12'].includes(wc.args.time??'')&&wc.args.cond?.replace(/\s/gu,'')==='kag.userChSpeed>0'&&close?.kind==='tag'&&close.name==='endmacro','AWAKENING_W_MACRO');strictArgs(wc,['time','cond']);const waitUnits=Number(literalArg(wc,'time'));
 const tokens=fresh(tokenize(lines.slice(begin+1,end).join('\n'),file,begin+1)),pages:AwakeningPage[]=[];let title='',mode:AwakeningPage['mode']='narration',style:TextStyle|undefined,runs:RichTextSourceRun[]=[],origin:Token['source']|undefined,italic=false,accent=false;
 const text=(value:string,at:Token['source'])=>{if(!value)return;origin??=at;runs.push(R.text(value,style||italic||accent?{...(style??{}),...(italic?{italic:true}:{}),...(accent?{scale:19/fontSize}:{})}:undefined));};
 for(const t of tokens){if(t.kind==='script')throw new Error('AWAKENING_SCRIPT');if(t.kind==='label'){const page=pages.at(-1);requireValue(page&&!page.id,'AWAKENING_LABEL');page.id=t.name;page.labelLine=t.source.line;continue;}if(t.kind==='text'){text(t.text,t.source);continue;}
  switch(t.name){
   case 'title':strictArgs(t,['name']);requireValue(!title,'AWAKENING_TITLE');title=literalArg(t,'name');break;
   case 'cm':strictArgs(t,[]);requireValue(!runs.length,'AWAKENING_UNCOMMITTED');break;
   case 'jinobun':strictArgs(t,[]);requireValue(!runs.length,'AWAKENING_CONTEXT');mode='narration';style=undefined;break;
   case 'monolog_gray':strictArgs(t,[]);requireValue(!runs.length,'AWAKENING_CONTEXT');mode='whisper';break;
   case 'font':strictArgs(t,['color','shadowcolor','shadow']);requireValue(t.args.color==='0x707070'&&t.args.shadowcolor==='0x242424'&&t.args.shadow==='true','AWAKENING_FONT');style={color:'#707070'};break;
   case 'c':strictArgs(t,['text']);requireValue(mode==='whisper','AWAKENING_CENTER');text(literalArg(t,'text'),t.source);break;
   case 'w':strictArgs(t,[]);origin??=t.source;runs.push(R.pauseUnits(waitUnits));break;
   case 'wait':strictArgs(t,['time']);requireValue(t.args.time==='1000','AWAKENING_WAIT');origin??=t.source;runs.push(R.pause(1000));break;
   case 'accent':{strictArgs(t,[]);const a=macroTokens.findIndex(n=>n.kind==='tag'&&n.name==='macro'&&n.args.name==='accent'),font=macroTokens[a+1];requireValue(!accent&&font?.kind==='tag'&&font.name==='font'&&font.args.size==='19'&&fontSize===18,'AWAKENING_ACCENT');accent=true;break;}
   case '/accent':strictArgs(t,[]);requireValue(accent,'AWAKENING_ACCENT');accent=false;break;
   case 'i':strictArgs(t,[]);requireValue(!italic,'AWAKENING_ITALIC');italic=true;break;
   case '/i':strictArgs(t,[]);requireValue(italic,'AWAKENING_ITALIC');italic=false,accent=false;break;
   case 'l':strictArgs(t,[]);runs.push(R.confirm());break;
   case 'r':strictArgs(t,[]);runs.push(R.br());break;
   case 'p':{strictArgs(t,[]);requireValue(origin&&runs.length&&!italic&&!accent,'AWAKENING_PAGE');const content=runs.map(r=>r.kind==='text'&&r.content.op==='literal'?r.content.value:r.kind==='break'?'\n':'').join('');requireValue(content.length>0,'AWAKENING_EMPTY');pages.push({id:'',text:content,runs,mode,source:origin,labelLine:0});runs=[];origin=undefined;break;}
   default:throw new Error(`AWAKENING_UNSUPPORTED ${t.name}:${t.source.line}`);
  }
 }
 requireValue(title&&pages.length===10&&pages.every(p=>p.id)&&new Set(pages.map(p=>p.id)).size===pages.length&&!runs.length,'AWAKENING_PAGES');return {pages,title,image:literalArg(image,'storage'),duration:4000,startLine:begin+1,endLine:end,profile:'fresh'};
}
