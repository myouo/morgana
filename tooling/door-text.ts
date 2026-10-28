import {tokenize,requireValue,strictArgs,literalArg} from './kag.js';
import type {Tag,SourcePoint,Token} from './kag.js';
import type {DoorIR} from './door-ir.js';
import type {ChapterPage} from './ks-po.js';
import {hash} from './locale.js';
export type DoorAtom={kind:'text';text:string;italic:boolean;scale:number;color:string;shadow:boolean;shadowColor:string}|{kind:'break'|'confirm'}|{kind:'units'|'pause';value:number}|{kind:'speed';value:number|'user'};
export interface DoorSpeaker {key:string;text:string;graphic:string|null;prefix:string;}
export interface DoorParagraph {id:string;context:string;scene:string;source:SourcePoint;parts:number;}
export type DoorNode={kind:'tag';tag:Tag}|Extract<Token,{kind:'label'}>|{kind:'text';at:string;paragraph:DoorParagraph;atoms:DoorAtom[];speaker:DoorSpeaker;align:'left'|'center'|'inset';completion:'input'|'continue'|'finish';historyCentered:boolean;appendFrom?:string;source:SourcePoint};
export function readDoorText(ir:DoorIR,macro:string,fontSize:number){
 const all=tokenize(macro,'macro.ks'),speakers=new Map<string,DoorSpeaker>(),names=new Set(['unknown','nellie','mell','whitehair','maid','priest','beggar','extra','arthur','jijo','voice','voice2','voice3','jinobun','monolog','monolog_gray']);
 for(const key of names){const start=all.findIndex(t=>t.kind==='tag'&&t.name==='macro'&&t.args.name===key);requireValue(start>=0,'DOOR_SPEAKER_MACRO '+key);const end=all.findIndex((t,i)=>i>start&&t.kind==='tag'&&t.name==='endmacro'),body=all.slice(start+1,end),name=body.find(t=>t.kind==='tag'&&(t.name==='draw_name'||t.name==='hisout')),graph=body.find(t=>t.kind==='tag'&&t.name==='graph');let text='';if(name?.kind==='tag')text=literalArg(name,name.name==='draw_name'?'name':'txt');if(name?.kind==='tag'&&name.name==='draw_name'&&text&&macro.includes("tf.name_box = '- ' + mp.name + ' -'"))text='- '+text+' -';speakers.set(key,{key,text,graphic:graph?.kind==='tag'?literalArg(graph,'storage'):null,prefix:body.filter(t=>t.kind==='text').map(t=>t.kind==='text'?t.text:'').join('')});}
 const wstart=all.findIndex(t=>t.kind==='tag'&&t.name==='macro'&&t.args.name==='w'),w=all[wstart+1];requireValue(w?.kind==='tag'&&w.name==='wc'&&['8','12'].includes(w.args.time??'')&&w.args.cond?.replace(/\s/gu,'')==='kag.userChSpeed>0','DOOR_WAIT_MACRO');const wend=all.findIndex((t,i)=>i>wstart&&t.kind==='tag'&&t.name==='endmacro');requireValue(wend===wstart+2,'DOOR_WAIT_BODY');const units=Number(w.args.time),ignoredArguments:{tag:string;source:SourcePoint;keys:string[]}[]=[];
 const nodes:DoorNode[]=[],paragraphs:DoorParagraph[]=[];let page:ChapterPage|undefined,paragraph:DoorParagraph|undefined,atoms:DoorAtom[]=[],lastAt:string|undefined,lastLength=0,speaker=speakers.get('jinobun')!,italic=false,scale=1,color='#FFFFFF',shadow=true,shadowColor='#2b2b2b',align:'left'|'center'|'inset'='left',alignSetting:'left'|'inset'='left',speed:number|'user'='user',historyCentered=false;
 const hasText=()=>atoms.some(a=>a.kind==='text'&&a.text.length>0);
 const flush=(completion:'input'|'continue'|'finish',at:SourcePoint)=>{if(!hasText())return;requireValue(paragraph&&page,'DOOR_PAGE_CONTEXT');if(completion==='continue'&&lastLength===atoms.length)return;const address=paragraph.id+':part'+paragraph.parts++;nodes.push({kind:'text',at:address,paragraph,atoms:atoms.map(a=>({...a})),speaker:{...speaker},align,completion,historyCentered,...(lastAt?{appendFrom:lastAt}:{}),source:at});lastAt=address;lastLength=atoms.length;};
 const effect=(tag:Tag)=>{flush('continue',tag.source);nodes.push({kind:'tag',tag});};
 for(const token of ir.tokens){
  if(token.kind==='page-start'){requireValue(!page,'DOOR_NESTED_PAGE');page=token.page;paragraph={id:'door1:'+hash(page.context).slice(0,24),context:page.context,scene:page.scene,source:page.source,parts:0};paragraphs.push(paragraph);atoms=[];lastAt=undefined;lastLength=0;align=alignSetting;if(speed!=='user')atoms.push({kind:'speed',value:speed});continue;}
  if(token.kind==='page-end'){requireValue(page?.context===token.page.context,'DOOR_PAGE_END');flush(token.page.ending==='p'?'input':'finish',token.source);page=undefined;paragraph=undefined;atoms=[];lastAt=undefined;lastLength=0;continue;}
  if(token.kind==='script')throw new Error('DOOR_SCRIPT');
  if(token.kind==='label'){nodes.push(token);continue;}
  if(token.kind==='text'){requireValue(page,'DOOR_UNOWNED_TEXT '+token.source.line);atoms.push({kind:'text',text:token.text,italic,scale,color,shadow,shadowColor});continue;}
  const t=token;
  if(names.has(t.name)){strictArgs(t,[]);requireValue(!hasText(),'DOOR_MIDPAGE_SPEAKER');speaker=speakers.get(t.name)!;if(t.name==='jinobun'){color='#9D9D9D';shadow=false;shadowColor='#242424';}scale=1;speed='user';if(page)atoms.push({kind:'speed',value:'user'});nodes.push({kind:'tag',tag:t});continue;}
  switch(t.name){
   case 'c':strictArgs(t,['text']);requireValue(page,'DOOR_CENTER_TEXT');align='center';atoms.push({kind:'text',text:literalArg(t,'text'),italic,scale,color,shadow,shadowColor});break;
   case 'style':strictArgs(t,['align']);requireValue(t.args.align==='center'&&speaker.key==='monolog_gray'&&!hasText(),'DOOR_TEXT_ALIGNMENT');alignSetting='inset';align='inset';break;
   case 'center_pos':strictArgs(t,['text']);align='center';break;
   case 'hc':case '/hc':strictArgs(t,[]);historyCentered=t.name==='hc';break;
   case 'r':strictArgs(t,[]);requireValue(page,'DOOR_BREAK');atoms.push({kind:'break'});break;
   case 'l':strictArgs(t,[]);requireValue(page,'DOOR_CONFIRM');atoms.push({kind:'confirm'});break;
   case 'w':requireValue(t.attributes.every(a=>a.mode==='literal'),'DOOR_WAIT_ARGUMENT_EXPRESSION');if(t.attributes.length)ignoredArguments.push({tag:'w',source:t.source,keys:Object.keys(t.args)});requireValue(page,'DOOR_UNITS');atoms.push({kind:'units',value:units});break;
   case 'wc':strictArgs(t,['time','cond']);requireValue(page&&t.args.cond?.replace(/\s/gu,'')==='kag.userChSpeed>0'&&Number.isInteger(Number(t.args.time)),'DOOR_WC');atoms.push({kind:'units',value:Number(t.args.time)});break;
   case 'i':case '/i':strictArgs(t,[]);italic=t.name==='i';break;
   case 'accent':case '/accent':strictArgs(t,[]);scale=t.name==='accent'?19/fontSize:1;break;
   case 'big':case '/big':strictArgs(t,[]);scale=t.name==='big'?24/fontSize:1;break;
   case 'delay':strictArgs(t,['speed']);speed=t.args.speed==='user'?'user':Number(t.args.speed);requireValue(speed==='user'||Number.isInteger(speed)&&speed>=0&&speed<=200,'DOOR_SPEED');if(page)atoms.push({kind:'speed',value:speed});break;
   case 'font':strictArgs(t,['color','shadowcolor','shadow']);requireValue(t.args.color==='0x707070'&&t.args.shadowcolor==='0x242424'&&['true','false'].includes(t.args.shadow??''),'DOOR_FONT');color='#707070';shadow=t.args.shadow==='true';shadowColor='#242424';nodes.push({kind:'tag',tag:t});break;
   case 'cm':strictArgs(t,[]);requireValue(!hasText(),'DOOR_UNFINISHED_CM');italic=false;scale=1;color='#FFFFFF';shadow=true;alignSetting='left';align='left';shadowColor='#2b2b2b';nodes.push({kind:'tag',tag:t});break;
   case 'wait':if(page&&hasText()&&t.args.canskip!=='false'){strictArgs(t,['time','canskip']);const duration=Number(t.args.time);requireValue(Number.isInteger(duration)&&duration>=0&&duration<=60000,'DOOR_INLINE_WAIT');atoms.push({kind:'pause',value:duration});}else effect(t);break;
   default:effect(t);
  }
 }
 requireValue(!page&&paragraphs.length===ir.extraction.pages.length,'DOOR_TEXT_COMPLETE');return {nodes,paragraphs,speakers,ignoredArguments};
}
