import {tokenize,requireValue,literalArg,strictArgs} from './kag.js';import type {Token,Tag} from './kag.js';
import {hash} from './locale.js';import type {Language} from './locale.js';
import type {SourceHistoryProfile} from './source-history-profile.js';
import type {readDoorText} from './door-text.js';

export interface SourceSpeakerReset {id:string;at:string;key:string;text:string;before:number;after:number;style:{fontSize:number;baseSize:number;color:string;italic:boolean;bold:boolean};line:number;}
function body(source:string,name:string){const ts=tokenize(source,'speaker-macros.ks'),a=ts.findIndex(t=>t.kind==='tag'&&t.name==='macro'&&t.args.name===name),b=ts.findIndex((t,n)=>n>a&&t.kind==='tag'&&t.name==='endmacro');requireValue(a>=0&&b>a,'SPEAKER_RESET_MACRO '+name);return ts.slice(a+1,b).filter(t=>t.kind!=='text'||t.text.trim());}
function fingerprint(tokens:readonly Token[]){return hash(JSON.stringify(tokens.map(t=>t.kind==='tag'?{name:t.name,args:t.args,attributes:t.attributes.map(a=>({name:a.name,value:a.value,mode:a.mode})),unparsed:t.unparsed}:t.kind==='text'?{text:t.text}:{kind:t.kind})));}
export function validateSpeakerResetSource(library:string,system:string){
 requireValue(fingerprint(body(library,'reset_speaker'))==='347c8586d0229b45bcc2c898444ce261b879dfb6d429e2d29f9b3c7e616a6e33','SPEAKER_RESET_SOURCE');requireValue(fingerprint(body(system,'ctrlSpeakingPerson'))==='390e9738d51fb4df08cd6a51ad9ef996b75ace9febf8fa82c785cf5272a359fa','SPEAKER_CONTROL_SOURCE');
 const draw=fingerprint(body(library,'draw_name'));requireValue(['5aa5b44cdd7051a1c5219e7deaf39899de5d79b38e759244ebc55d4ceb7c73c4','aeb05fd74ae0abe9a64588e0cccab93dff7323f817d2b04f194bef9d310de3b6','a7a5ff6801c263b0f9e13766b0e2ebb47f392db104c6488f16b249148456916c'].includes(draw),'SPEAKER_DRAW_SOURCE');return draw;
}
/** Finite source display plan: a literal reset immediately followed by a known speaker. */
export function sourceSpeakerResets(story:ReturnType<typeof readDoorText>,library:string,system:string,profile:SourceHistoryProfile,locale:Language){
 const nodes=story.nodes,resets=nodes.flatMap((n,i)=>n.kind==='tag'&&n.tag.name==='reset_speaker'?[i]:[]);if(!resets.length)return [];
 validateSpeakerResetSource(library,system);requireValue(profile.name,'SPEAKER_RESET_NAME_FORMAT');const font=['jp','ko','zh'].includes(locale)?22:18,out:SourceSpeakerReset[]=[];
 for(const index of resets){const reset=nodes[index]!;requireValue(reset.kind==='tag','SPEAKER_RESET_TAG');strictArgs(reset.tag,[]);const speaker=nodes[index+1];requireValue(speaker?.kind==='tag'&&story.speakers.has(speaker.tag.name),'SPEAKER_RESET_NOT_IMMEDIATE');
  const macro=body(library,speaker.tag.name);requireValue(macro.length===2&&macro[0]?.kind==='tag'&&macro[0].name==='ctrlspeakingperson'&&macro[1]?.kind==='tag'&&macro[1].name==='draw_name','SPEAKER_RESET_WRAPPER');const control=macro[0],draw=macro[1];strictArgs(control,['speaker']);strictArgs(draw,['name','no_newline','center']);requireValue(draw.attributes.every(a=>a.mode==='literal')&&draw.args.center===undefined&&[undefined,'true'].includes(draw.args.no_newline),'SPEAKER_RESET_DRAW_OPTIONS');const key=literalArg(control,'speaker'),name=literalArg(draw,'name');requireValue(name.length>0&&name.length<=128,'SPEAKER_RESET_LITERAL_NAME');
  let extra=0,target:typeof nodes[number]|undefined;for(const next of nodes.slice(index+2)){if(next.kind==='tag'&&next.tag.name==='hr'){strictArgs(next.tag,[]);extra++;continue;}target=next;break;}
  requireValue(target,'SPEAKER_RESET_TARGET');const text=profile.name.prefix+name+profile.name.suffix;requireValue(text.length<=256&&extra<=3,'SPEAKER_RESET_DISPLAY_BOUND');const after=(draw.args.no_newline==='true'?0:1)+extra;
  if(target.kind==='text'){requireValue(target.recordHistory!==false&&target.historySpeaker!==false,'SPEAKER_RESET_BODY_SUPPRESSED');const first=target.atoms.find(a=>a.kind==='text');requireValue(first?.kind==='text','SPEAKER_RESET_BODY_STYLE');for(const part of nodes)if(part.kind==='text'&&part.paragraph.id===target.paragraph.id)out.push({id:part.paragraph.id,at:part.at,key,text,before:1,after,style:{fontSize:profile.name.fontSize,baseSize:font,color:first.color,italic:first.italic,bold:first.bold??false},line:reset.tag.source.line});}
  else{requireValue(target.kind==='tag'&&target.historyAnnotation?.enabled,'SPEAKER_RESET_NOT_LINEAR');const note=target.historyAnnotation,at='door4:history-'+hash('door4|'+target.tag.source.file+'|'+target.tag.source.line+'|'+target.tag.source.column+'|'+target.tag.name).slice(0,24);out.push({id:at,at,key,text,before:1,after,style:{fontSize:profile.name.fontSize,baseSize:font,color:note.style.color,italic:note.style.italic,bold:note.style.bold},line:reset.tag.source.line});}
 }
 return out;
}
