import {readFile} from 'node:fs/promises';
import {hash} from './locale.js';
import type {Language} from './locale.js';
import {tokenize,literalArg,strictArgs,requireValue} from './kag.js';
import type {Tag} from './kag.js';

export interface SourceHistoryProfile {maxLines:number;wrapping:'incremental'|'deferred';styleRuns:boolean;storeSha256:string;name?:{prefix:string;suffix:string;fontSize:number;face:string};}
// Source-bound profiles, not code execution or a generic TJS evaluator.
const stores=new Map([
 ['4f349940bc5e6238c0640fef6b3251c294071a763e88089a797956a32b52ec87',{wrapping:'incremental' as const,styleRuns:false}],
 ['fdfc3fe512c8c3ef484fc6ec3f5c5920f35dee29fa1127a3ae065229d487282f',{wrapping:'deferred' as const,styleRuns:true}],
 ['a826cb37cd36eb9bcc5e9766b12b0334b015441eb749975cb48efb79b057adb1',{wrapping:'deferred' as const,styleRuns:true}],
]);
function macro(source:string,name:string){const tokens=tokenize(source,'history-macros.ks'),a=tokens.findIndex(t=>t.kind==='tag'&&t.name==='macro'&&t.args.name===name);if(a<0)return;const z=tokens.findIndex((t,n)=>n>a&&t.kind==='tag'&&t.name==='endmacro');requireValue(z>a,'HISTORY_MACRO_END');return tokens.slice(a+1,z).filter(t=>t.kind!=='text'||t.text.trim());}
export async function sourceHistoryProfile(locale:Language):Promise<SourceHistoryProfile>{
 const root=`private/text/${locale}`,[config,history,system,library]=await Promise.all([readFile(root+'/system/Config.tjs','utf8'),readFile(root+'/system/HistoryLayer.tjs','utf8').then(s=>s.replace(/\r\n/gu,'\n')),readFile(root+'/scenario/system_define.ks','utf8'),readFile(root+'/scenario/macro.ks','utf8')]),start=history.indexOf('function store('),end=history.indexOf('\n\tfunction ',start+10);requireValue(start>=0&&end>start,'HISTORY_STORE_SOURCE');const storeSha256=hash(history.slice(start,end)),shape=stores.get(storeSha256);requireValue(shape,'HISTORY_STORE_PROFILE '+locale);const maxLines=Number(/^;maxLines\s*=\s*(\d+)/mu.exec(config)?.[1]);requireValue(/^;autoReturn\s*=\s*true\s*;/mu.test(config),'HISTORY_AUTO_RETURN_PROFILE');requireValue(/^;everypage\s*=\s*false\s*;/mu.test(config)&&[500,2000].includes(maxLines),'HISTORY_SOURCE_CAPACITY');
 const output=macro(system,'hisout');requireValue(output?.length===1&&output[0]?.kind==='tag'&&output[0].name==='eval','HISTORY_OUTPUT_MACRO');strictArgs(output[0],['exp','cond']);requireValue(literalArg(output[0],'exp')==='kag.historyLayer.store(mp.txt)'&&literalArg(output[0],'cond')==='kag.historyWriteEnabled','HISTORY_OUTPUT_SEMANTICS');
 const name=macro(library,'hisname');let format:SourceHistoryProfile['name'];if(name){requireValue(name.length===3&&name[0]?.kind==='tag'&&name[0].name==='font'&&name[1]?.kind==='tag'&&name[1].name==='hisout'&&name[2]?.kind==='tag'&&name[2].name==='resetfont','HISTORY_NAME_MACRO');strictArgs(name[0],['size','face']);strictArgs(name[1],['txt']);strictArgs(name[2],[]);requireValue(name[1].args.txt==='&formatHistoryName(mp.name)'&&name[1].attributes.find(a=>a.name==='txt')?.mode==='expression','HISTORY_NAME_EXPRESSION');const match=/function\s+formatHistoryName\(name\)\s*\{\s*return\s*("(?:[^"\\]|\\.)*")\s*\+\s*name\s*\+\s*("(?:[^"\\]|\\.)*")\s*;\s*\}/u.exec(library);requireValue(match,'HISTORY_NAME_FORMAT');format={prefix:JSON.parse(match[1]!),suffix:JSON.parse(match[2]!),fontSize:Number(literalArg(name[0],'size')),face:literalArg(name[0],'face')};requireValue(format.fontSize>0&&format.fontSize<=64,'HISTORY_NAME_FONT');}
 return {maxLines,...shape,storeSha256,...(format?{name:format}:{})};
}
/** Resolve only authored literal arguments; callers must preserve output state/order. */
export function historyAnnotation(tag:Tag,profile:SourceHistoryProfile){
 requireValue(tag.name==='hisout'||tag.name==='hisname','HISTORY_ANNOTATION_TAG');
 if(tag.name==='hisname'){strictArgs(tag,['name']);requireValue(profile.name,'HISTORY_NAME_UNAVAILABLE');return {text:profile.name.prefix+literalArg(tag,'name')+profile.name.suffix,style:{fontSize:profile.name.fontSize,face:profile.name.face},resetFont:true as const,append:true as const,condition:'historyWriteEnabled' as const};}
 const malformed=hash(tag.raw)==='9d282d427fc942d2036060c39651b5357ce23301247fcfaf96960dfac90b7863';strictArgs(tag,malformed?['txt','"']:['txt']);return {text:literalArg(tag,'txt'),append:true as const,condition:'historyWriteEnabled' as const,...(malformed?{sourceIssue:'SOURCE_UNUSED_MALFORMED_ATTRIBUTE'}:{})};
}
