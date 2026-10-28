import {richText} from 'galbox-sdk/port-kit';
import type {RichTextSourceRun,TextStyle} from 'galbox-sdk/protocol';
import {requireValue} from './kag.js';
type ControlKind='break'|'confirm'|'pause'|'speed'|'style'|'endstyle'|'ruby'|'reading'|'endruby'|'pauseunits';
interface Control {kind:ControlKind;source:RichTextSourceRun;marker:string;}
const markerPattern=/\{\{gb:([a-z]+):(\d+)\}\}/gu;
function literal(value:string):string {requireValue(!value.includes('{{gb:'),'PO_RESERVED_MARKER');return value;}
function template(runs:readonly RichTextSourceRun[]):{text:string;controls:Control[]}{
 const controls:Control[]=[];const mark=(kind:ControlKind,source:RichTextSourceRun)=>{const marker=`{{gb:${kind}:${controls.length}}}`;controls.push({kind,source,marker});return marker;};
 const text=runs.map(run=>{
  if(run.kind==='text'){requireValue(run.content.op==='literal','PO_TEXT_UNSUPPORTED');const value=literal(run.content.value);return run.style?mark('style',run)+value+mark('endstyle',run):value;}
  if(run.kind==='ruby'){requireValue(run.content.op==='literal'&&run.reading.op==='literal','PO_TEXT_UNSUPPORTED');return mark('ruby',run)+literal(run.content.value)+mark('reading',run)+literal(run.reading.value)+mark('endruby',run);}
  if(run.kind==='pause.units')return mark('pauseunits',run);
  requireValue(['break','confirm','pause','speed'].includes(run.kind),'PO_CONTROL_UNSUPPORTED');return mark(run.kind,run);
 }).join('');return {text,controls};
}
export function encodePOText(runs:readonly RichTextSourceRun[]):string{return template(runs).text;}
export function poControls(runs:readonly RichTextSourceRun[]):ControlKind[]{return template(runs).controls.map(c=>c.kind);}
/** Protected markers retain source styles/timing; translation text never becomes executable markup. */
export function decodePOText(text:string,source:readonly RichTextSourceRun[]):{runs:RichTextSourceRun[];plain:string}{
 const {controls}=template(source),matches=[...text.matchAll(markerPattern)];requireValue(matches.length===controls.length&&matches.every((m,i)=>m[0]===controls[i]?.marker),'PO_CONTROL_MARKERS');
 const runs:RichTextSourceRun[]=[];let at=0,styleText=false,style:TextStyle|undefined,ruby:{source:Extract<RichTextSourceRun,{kind:'ruby'}>;base:string;reading:string;phase:'base'|'reading'}|undefined;
 const append=(part:string)=>{requireValue(!part.includes('{{gb:'),'PO_CONTROL_MARKERS');if(!part)return;if(ruby){ruby[ruby.phase]+=part;}else {if(style)styleText=true;runs.push(richText.text(part,style));}};
 for(const [index,match]of matches.entries()){
  append(text.slice(at,match.index));const control=controls[index];requireValue(control,'PO_CONTROL_MARKERS');const run=control.source;
  switch(control.kind){
   case 'style':requireValue(run.kind==='text'&&run.style&&!style&&!ruby,'PO_STYLE');style=run.style;styleText=false;break;
   case 'endstyle':requireValue(style&&styleText&&!ruby,'PO_STYLE');style=undefined;break;
   case 'ruby':requireValue(run.kind==='ruby'&&!ruby&&!style,'PO_RUBY');ruby={source:run,base:'',reading:'',phase:'base'};break;
   case 'reading':requireValue(ruby&&ruby.phase==='base','PO_RUBY');ruby.phase='reading';break;
   case 'endruby':requireValue(ruby&&ruby.phase==='reading'&&ruby.base.length>0&&ruby.reading.length>0,'PO_RUBY');runs.push(richText.ruby(ruby.base,ruby.reading,ruby.source.style));ruby=undefined;break;
   case 'break':requireValue(!ruby&&!style,'PO_CONTROL_MARKERS');runs.push(richText.br());break;
   case 'confirm':requireValue(!ruby&&!style,'PO_CONTROL_MARKERS');runs.push(richText.confirm());break;
   case 'pause':requireValue(run.kind==='pause'&&!ruby&&!style,'PO_CONTROL_MARKERS');runs.push(richText.pause(run.duration));break;
   case 'pauseunits':requireValue(run.kind==='pause.units'&&!ruby&&!style,'PO_CONTROL_MARKERS');runs.push(richText.pauseUnits(run.units));break;
   case 'speed':requireValue(run.kind==='speed'&&!ruby&&!style,'PO_CONTROL_MARKERS');runs.push(richText.speed(run.intervalMs));break;
  }
  at=match.index+match[0].length;
 }
 append(text.slice(at));requireValue(!style&&!ruby&&runs.length>0,'PO_EMPTY_PAGE');
 const plain=runs.map(r=>(r.kind==='text'||r.kind==='ruby')&&r.content.op==='literal'?r.content.value:r.kind==='break'?'\n':'').join('');requireValue(plain.length>0,'PO_EMPTY_PAGE');return {runs,plain};
}
