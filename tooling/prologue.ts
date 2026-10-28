import {tokenize,requireValue,strictArgs,literalArg} from './kag.js';
import type {Token,Tag,SourcePoint} from './kag.js';
import {richText as R} from 'galbox-sdk/port-kit';
import type {RichTextSourceRun,TextStyle} from 'galbox-sdk/protocol';
import type {OpeningPage} from './opening.js';
export interface ProloguePage extends OpeningPage {mode:'narration'|'whisper'|'speech';speaker:string;}
export type PrologueNode={kind:'page';page:ProloguePage}|{kind:'label';name:string;source:SourcePoint}|{kind:'tag';tag:Tag}|{kind:'choice';id:string;options:{id:string;text:string;target:string;x:number;y:number;graphic:string}[];delay:number;autosave:boolean;source:SourcePoint};
export interface Prologue {fontSize:number;pages:ProloguePage[];nodes:PrologueNode[];title:string;startLine:number;endLine:number;source:string;profile:'fresh';}
export function freshProfile(tokens:readonly Token[]):Token[]{const out:Token[]=[],stack:{parent:boolean;condition:boolean;otherwise:boolean}[]=[];let active=true;for(const t of tokens){if(t.kind==='tag'&&t.name==='if'){strictArgs(t,['exp']);const exp=literalArg(t,'exp').replace(/\s/gu,'');requireValue(['sf.fataend==1','sf.fataend!=1'].includes(exp),'PROLOGUE_CONDITION '+exp);const condition=exp==='sf.fataend!=1';stack.push({parent:active,condition,otherwise:false});active=active&&condition;}else if(t.kind==='tag'&&t.name==='else'){strictArgs(t,[]);const top=stack.at(-1);requireValue(top&&!top.otherwise,'PROLOGUE_ELSE');top.otherwise=true;active=top.parent&&!top.condition;}else if(t.kind==='tag'&&t.name==='endif'){strictArgs(t,[]);const top=stack.pop();requireValue(top,'PROLOGUE_ENDIF');active=top.parent;}else if(active)out.push(t);}requireValue(!stack.length,'PROLOGUE_UNCLOSED_IF');return out;}
export function readPrologue(source:string,macro:string,fontSize=18):Prologue {
 const all=tokenize(source,'scenario/scenario.ks'),start=all.findIndex(t=>t.kind==='label'&&t.name==='zero2'),end=all.findIndex((t,i)=>i>start&&t.kind==='label'&&t.name==='scenario1start');requireValue(start>=0&&end>start,'PROLOGUE_BOUNDARY');const tokens=freshProfile(all.slice(start,end)),macros=tokenize(macro,'scenario/macro.ks');
 const body=(name:string)=>{const i=macros.findIndex(t=>t.kind==='tag'&&t.name==='macro'&&t.args.name===name);requireValue(i>=0,'PROLOGUE_MACRO '+name);const e=macros.findIndex((t,n)=>n>i&&t.kind==='tag'&&t.name==='endmacro');requireValue(e>i,'PROLOGUE_MACRO_END');return macros.slice(i+1,e);};
 const wait=body('w');requireValue(wait.length===1&&wait[0]?.kind==='tag'&&wait[0].name==='wc'&&['8','12'].includes(wait[0].args.time??'')&&wait[0].args.cond?.replace(/\s/gu,'')==='kag.userChSpeed>0','PROLOGUE_W');const units=Number(wait[0].args.time),unknown=body('unknown').find(t=>t.kind==='tag'&&(t.name==='draw_name'||t.name==='hisout'));requireValue(unknown?.kind==='tag','PROLOGUE_SPEAKER');const rawSpeaker=literalArg(unknown,unknown.name==='draw_name'?'name':'txt');requireValue(/^(?:\?\?\?|[-\s]*[?？]{3}[-\s]*)$/u.test(rawSpeaker),'PROLOGUE_UNKNOWN_NAME');const speaker=unknown.name==='draw_name'&&macro.includes("tf.name_box = '- ' + mp.name + ' -'")?'- '+rawSpeaker+' -':rawSpeaker;
 const pages:ProloguePage[]=[],nodes:PrologueNode[]=[],labels=new Map<string,number>();let lastLabel='zero2',unlabelled=0,title='',mode:ProloguePage['mode']='narration',runs:RichTextSourceRun[]=[],origin:SourcePoint|undefined,italic=false,accent=false;let pending:ProloguePage|undefined,choice:{text:string;options:Extract<PrologueNode,{kind:'choice'}>['options'];delay:number;autosave:boolean;x:number;y:number;source:SourcePoint}|undefined;
 const text=(value:string,at:SourcePoint)=>{if(choice){choice.text+=value;return;}if(!value)return;origin??=at;const style:TextStyle={...(mode==='whisper'?{color:'#707070'}:{}),...(italic?{italic:true}:{}),...(accent?{scale:19/fontSize}:{})};runs.push(R.text(value,Object.keys(style).length?style:undefined));};
 const closePage=(at:SourcePoint)=>{requireValue(runs.length&&origin&&!italic&&!accent,'PROLOGUE_PAGE');const value=runs.map(r=>r.kind==='text'&&r.content.op==='literal'?r.content.value:r.kind==='break'?'\n':'').join('');const page:ProloguePage={id:'',text:value,runs,source:origin,labelLine:at.line,mode,speaker:mode==='speech'?speaker:''};pages.push(page);nodes.push({kind:'page',page});pending=page;runs=[];origin=undefined;};
 const resolvePending=()=>{if(pending&&!pending.id){pending.id=`unlabelled-${lastLabel}-${++unlabelled}`;pending=undefined;}};
 for(const t of tokens){
  if(t.kind==='script')throw new Error('PROLOGUE_SCRIPT');
  if(t.kind==='label'){if(runs.length){requireValue(!!choice,'PROLOGUE_TEXT_WITHOUT_PAGE');}const n=(labels.get(t.name)??0)+1;labels.set(t.name,n);if(pending){pending.id=t.name+(n>1?`-repeat${n}`:'');pending.labelLine=t.source.line;pending=undefined;}lastLabel=t.name;unlabelled=0;nodes.push({kind:'label',name:t.name+(n>1?`-repeat${n}`:''),source:t.source});continue;}
  if(t.kind==='text'){resolvePending();text(t.text,t.source);continue;}
  if(choice){
   if(t.name==='r'){choice.text+='\n';continue;}if(t.name==='wait'){strictArgs(t,['time','canskip']);requireValue(t.args.time==='200'&&t.args.canskip==='false','PROLOGUE_CHOICE_WAIT');choice.delay=200;continue;}
   if(t.name==='locate'){strictArgs(t,['x','y']);choice.x=Number(literalArg(t,'x'));choice.y=Number(literalArg(t,'y'));continue;}
   if(t.name==='button'){strictArgs(t,['graphic','target','enterse','clickse']);requireValue(t.args.enterse==='button'&&t.args.clickse==='click','PROLOGUE_CHOICE_CUE');choice.options.push({id:`greeting-${choice.options.length}`,text:'',target:literalArg(t,'target').replace(/^\*/u,''),x:choice.x,y:choice.y,graphic:literalArg(t,'graphic')});continue;}
   if(t.name==='autosave'){strictArgs(t,[]);choice.autosave=true;continue;}
   if(t.name==='s'){strictArgs(t,[]);const lines=choice.text.split('\n').map(s=>s.trim()).filter(Boolean);requireValue(lines.length===2&&choice.options.length===2&&choice.delay===200,'PROLOGUE_CHOICE');for(const [i,o]of choice.options.entries())o.text=lines[i]!;nodes.push({kind:'choice',id:'greeting',options:choice.options,delay:choice.delay,autosave:choice.autosave,source:choice.source});choice=undefined;continue;}
   throw new Error('PROLOGUE_CHOICE_TAG '+t.name);
  }
  switch(t.name){
   case 'title':strictArgs(t,['name']);title=literalArg(t,'name');break;
   case 'jinobun':case 'monolog_gray':case 'unknown':strictArgs(t,[]);requireValue(!runs.length,'PROLOGUE_TEXT_CONTEXT');mode=t.name==='unknown'?'speech':t.name==='jinobun'?'narration':'whisper';nodes.push({kind:'tag',tag:t});break;
   case 'font':strictArgs(t,['color','shadowcolor','shadow']);requireValue(t.args.color==='0x707070'&&t.args.shadowcolor==='0x242424'&&t.args.shadow==='true','PROLOGUE_FONT');break;
   case 'c':strictArgs(t,['text']);resolvePending();text(literalArg(t,'text'),t.source);break;
   case 'w':strictArgs(t,[]);resolvePending();origin??=t.source;runs.push(R.pauseUnits(units));break;
   case 'wc':strictArgs(t,['time','cond']);requireValue(t.args.cond?.replace(/\s/gu,'')==='kag.userChSpeed>0','PROLOGUE_WC_CONDITION');resolvePending();origin??=t.source;requireValue(Number.isInteger(Number(t.args.time))&&Number(t.args.time)>0,'PROLOGUE_WC');runs.push(R.pauseUnits(Number(t.args.time)));break;
   case 'wait':if(mode==='whisper'&&!runs.length){strictArgs(t,['time']);requireValue(t.args.time==='1000','PROLOGUE_INLINE_WAIT');resolvePending();origin=t.source;runs.push(R.pause(1000));}else nodes.push({kind:'tag',tag:t});break;
   case 'i':strictArgs(t,[]);requireValue(!italic,'PROLOGUE_ITALIC');italic=true;break;
   case '/i':strictArgs(t,[]);requireValue(italic,'PROLOGUE_ITALIC');italic=false;break;
   case 'accent':strictArgs(t,[]);requireValue(body('accent').some(n=>n.kind==='tag'&&n.name==='font'&&n.args.size==='19'),'PROLOGUE_ACCENT');accent=true;break;
   case '/accent':strictArgs(t,[]);requireValue(accent,'PROLOGUE_ACCENT');accent=false;break;
   case 'l':strictArgs(t,[]);origin??=t.source;runs.push(R.confirm());break;
   case 'r':strictArgs(t,[]);origin??=t.source;runs.push(R.br());break;
   case 'p':strictArgs(t,[]);resolvePending();closePage(t.source);break;
   case 'choice':strictArgs(t,[]);requireValue(!runs.length,'PROLOGUE_CHOICE_PENDING');choice={text:'',options:[],delay:0,autosave:false,x:0,y:0,source:t.source};nodes.push({kind:'tag',tag:t});break;
   case 'cm':strictArgs(t,[]);requireValue(!runs.length,'PROLOGUE_UNCOMMITTED_TEXT');nodes.push({kind:'tag',tag:t});break;
   default:requireValue(!runs.length,'PROLOGUE_INLINE_EFFECT '+t.name);nodes.push({kind:'tag',tag:t});
  }
 }
 resolvePending();requireValue(!runs.length&&!choice&&title&&pages.length>=73&&pages.length<=74&&new Set(pages.map(p=>p.id)).size===pages.length,'PROLOGUE_COMPLETE');return {fontSize,pages,nodes,title,startLine:all[start]!.source.line,endLine:all[end]!.source.line,source:source.split(/\r?\n/u).slice(all[start]!.source.line-1,all[end]!.source.line-1).join('\n'),profile:'fresh'};
}
