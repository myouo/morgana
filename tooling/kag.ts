/** KAG3 lexical profile, checked against the public KAGParser implementation.
 * TJS expressions and macro values remain data. CR policy is a compiler concern.
 */
export interface SourcePoint {readonly file:string;readonly line:number;readonly column:number;}
export interface Attribute {readonly name:string;readonly value:string;readonly mode:'literal'|'expression'|'parameter'|'inherit';readonly source:SourcePoint;}
export type Token =
 | {kind:'text';text:string;source:SourcePoint}
 | {kind:'tag';name:string;args:Readonly<Record<string,string>>;attributes:readonly Attribute[];raw:string;unparsed:string;source:SourcePoint}
 | {kind:'label';name:string;title:string;source:SourcePoint}
 | {kind:'script';text:string;source:SourcePoint};
export type Tag=Extract<Token,{kind:'tag'}>;
export function requireValue(condition:unknown,message:string):asserts condition {if(!condition)throw new Error(message);}
function tag(raw:string,source:SourcePoint):Tag {
 const name=/^\s*([^\s]+)/u.exec(raw)?.[1];requireValue(name,`KAG_TAG ${source.file}:${source.line}`);let cursor=raw.indexOf(name)+name.length;const attributes:Attribute[]=[];
 while(cursor<raw.length){while(/\s/u.test(raw[cursor]??'')&&cursor<raw.length)cursor++;if(cursor===raw.length)break;const start=cursor;
  if(raw[cursor]==='*'){cursor++;attributes.push({name:'*',value:'',mode:'inherit',source:{...source,column:source.column+1+start}});continue;}
  while(cursor<raw.length&&!/[\s=]/u.test(raw[cursor]??''))cursor++;const key=raw.slice(start,cursor).toLowerCase();requireValue(key,`KAG_ATTRIBUTE ${source.file}:${source.line}`);while(cursor<raw.length&&/\s/u.test(raw[cursor]??''))cursor++;
  let value='true',mode:Attribute['mode']='literal';
  if(raw[cursor]==='='){cursor++;while(cursor<raw.length&&/\s/u.test(raw[cursor]??''))cursor++;requireValue(cursor<raw.length,`KAG_ATTRIBUTE_VALUE ${source.file}:${source.line}`);if(raw[cursor]==='&'||raw[cursor]==='%'){mode=raw[cursor]==='&'?'expression':'parameter';cursor++;}
   const quote=raw[cursor]==='"'||raw[cursor]==="'"?raw[cursor++]:undefined;value='';let closed=!quote;
   while(cursor<raw.length){const c=raw[cursor];if(quote&&c===quote){cursor++;closed=true;break;}if(!quote&&/\s/u.test(c??''))break;if(c==='`'){cursor++;requireValue(cursor<raw.length,`KAG_ESCAPE ${source.file}:${source.line}`);}value+=raw[cursor];cursor++;}
   requireValue(closed,`KAG_ATTRIBUTE_QUOTE ${source.file}:${source.line}`);if(mode==='literal'&&(value.startsWith('&')||value.startsWith('%'))){mode=value[0]==='&'?'expression':'parameter';value=value.slice(1);}
  }
  attributes.push({name:key,value,mode,source:{...source,column:source.column+1+start}});
 }
 // Native KAG fills a dictionary in source order: repeated attributes overwrite.
 // Retain the ordered inputs as well so a compiler can audit each overwrite.
 const args=Object.fromEntries(attributes.map(a=>[a.name,a.mode==='expression'?'&'+a.value:a.mode==='parameter'?'%'+a.value:a.mode==='inherit'?'*':a.value]));
 return {kind:'tag',name:name.toLowerCase(),args,attributes,raw,unparsed:'',source};
}
export function tokenize(text:string,file:string,lineOffset=0):Token[] {
 const result:Token[]=[];let script=false;
 for(const [row,original]of text.replace(/^\ufeff/u,'').split(/\r?\n/u).entries()){
  const tabs=/^\t*/u.exec(original)?.[0].length??0,line=original.slice(tabs),source={file,line:row+1+lineOffset,column:tabs+1};
  if(script){if(line.trim()==='[endscript]'||line.trim()==='@endscript'){script=false;result.push(tag('endscript',source));}else result.push({kind:'script',text:original,source});continue;}
  if(!line||line.startsWith(';'))continue;
  if(line.startsWith('*')){const split=line.indexOf('|');result.push({kind:'label',name:line.slice(1,split<0?undefined:split),title:split<0?'':line.slice(split+1),source});continue;}
  if(line.startsWith('@')){const t=tag(line.slice(1),source);result.push(t);if(t.name==='iscript')script=true;continue;}
  let cursor=0,plain='',plainStart=0;const emit=()=>{if(plain){result.push({kind:'text',text:plain,source:{...source,column:tabs+plainStart+1}});plain='';}};
  while(cursor<line.length){const c=line[cursor];if(c!=='['){if(!plain)plainStart=cursor;plain+=c;cursor++;continue;}if(line[cursor+1]==='['){if(!plain)plainStart=cursor;plain+='[';cursor+=2;continue;}emit();const start=cursor++;let quote='';
   while(cursor<line.length){const q=line[cursor];if(q==='`'){cursor+=2;continue;}if(quote){if(q===quote)quote='';}else if((q==='"'||q==="'")&&/[=\s&%]$/u.test(line.slice(start+1,cursor)))quote=q;else if(q===']')break;cursor++;}
   requireValue(cursor<line.length,`KAG_UNCLOSED_TAG ${file}:${row+1+lineOffset}`);const t=tag(line.slice(start+1,cursor),{...source,column:tabs+start+1});result.push(t);cursor++;if(t.name==='iscript')script=true;
  }emit();
 }
 requireValue(!script,`KAG_UNCLOSED_SCRIPT ${file}`);return result;
}
export function labelIndex(tokens:readonly Token[],name:string):number {const i=tokens.findIndex(t=>t.kind==='label'&&t.name===name);requireValue(i>=0,`KAG_LABEL ${name}`);return i;}
export function strictArgs(t:Tag,keys:readonly string[]):void {requireValue(!t.unparsed.trim(),`UNSUPPORTED_TAG_SYNTAX ${t.source.file}:${t.source.line} ${t.name}`);requireValue(Object.keys(t.args).every(k=>keys.includes(k)),`UNSUPPORTED_ARGUMENT ${t.source.file}:${t.source.line} ${t.name}`);}
export function literalArg(t:Tag,key:string):string {const a=t.attributes.filter(a=>a.name===key).at(-1);requireValue(a?.mode==='literal',`UNSUPPORTED_DYNAMIC_ARGUMENT ${t.source.file}:${t.source.line} ${t.name}.${key}`);return a.value;}
