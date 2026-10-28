import {tokenize,requireValue,literalArg} from './kag.js';
import type {Tag,Token,SourcePoint} from './kag.js';
export type KagNode=Exclude<Token,{kind:'script'}>
 | {kind:'conditional';header:Tag;arms:{test:Tag|null;body:KagNode[]}[];source:SourcePoint}
 | {kind:'ignore';header:Tag;body:KagNode[];source:SourcePoint}
 | {kind:'macro';header:Tag;name:string|null;template:Token[];source:SourcePoint}
 | {kind:'script';text:string;source:SourcePoint};
export interface LabelSymbol {declaredName:string;name:string;occurrence:number;source:SourcePoint;}
export interface KagDocument {file:string;nodes:KagNode[];labels:LabelSymbol[];tokens:number;controlProfile:'structured'|'raw';}
/** Structural front-end only; dynamic expressions/registration are not executed. */
export function parseKag(text:string,file:string,lineOffset=0,controlProfile:'structured'|'raw'='structured'):KagDocument {
 const tokens=tokenize(text,file,lineOffset);requireValue(tokens.length<=300000,'KAG_TOKEN_BUDGET');let cursor=0;
 const blocks=new Set(['else','elsif','endif','endignore','endmacro','endscript']);
 function body(until:ReadonlySet<string>,depth:number,inMacro:boolean):KagNode[]{requireValue(depth<=64,'KAG_BLOCK_DEPTH');const nodes:KagNode[]=[];
  while(cursor<tokens.length){const t=tokens[cursor];requireValue(t,'KAG_TOKEN');if(t.kind==='tag'&&until.has(t.name))break;cursor++;
   if(t.kind==='script')throw new Error(`KAG_SCRIPT_BOUNDARY ${file}:${t.source.line}`);
   if(t.kind==='label'){requireValue(!inMacro,`KAG_LABEL_IN_MACRO ${file}:${t.source.line}`);nodes.push(t);continue;}
   if(t.kind!=='tag'){nodes.push(t);continue;}
   if(controlProfile==='raw'&&['if','else','elsif','endif','ignore','endignore'].includes(t.name)){nodes.push(t);continue;}
   if(blocks.has(t.name))throw new Error(`KAG_UNEXPECTED_BLOCK ${file}:${t.source.line} ${t.name}`);
   if(t.name==='iscript'){requireValue(!inMacro,`KAG_SCRIPT_IN_MACRO ${file}:${t.source.line}`);const lines:string[]=[];let closed=false;while(cursor<tokens.length){const next=tokens[cursor++];if(next?.kind==='tag'&&next.name==='endscript'){closed=true;break;}requireValue(next?.kind==='script','KAG_SCRIPT_BOUNDARY');lines.push(next.text);}requireValue(closed,'KAG_UNCLOSED_SCRIPT');nodes.push({kind:'script',text:lines.join('\n'),source:t.source});continue;}
   if(t.name==='if'){const arms:{test:Tag|null;body:KagNode[]}[]=[];let test:Tag|null=t,closed=false;for(;;){arms.push({test,body:body(new Set(['elsif','else','endif']),depth+1,inMacro)});const next=tokens[cursor++];requireValue(next?.kind==='tag',`KAG_UNCLOSED_IF ${file}:${t.source.line}`);if(next.name==='endif'){closed=true;break;}requireValue(test!==null,`KAG_ELSE_ORDER ${file}:${next.source.line}`);test=next.name==='else'?null:next;}requireValue(closed,'KAG_UNCLOSED_IF');nodes.push({kind:'conditional',header:t,arms,source:t.source});continue;}
   if(t.name==='macro'){const template:Token[]=[];let closed=false;while(cursor<tokens.length){const next=tokens[cursor++];if(next?.kind==='tag'&&next.name==='endmacro'){closed=true;break;}requireValue(next&&next.kind!=='label'&&next.kind!=='script'&&!(next.kind==='tag'&&next.name==='iscript'),`KAG_FORBIDDEN_MACRO_BODY ${file}:${t.source.line}`);template.push(next);}requireValue(closed,`KAG_UNCLOSED_MACRO ${file}:${t.source.line}`);const attribute=t.attributes.filter(a=>a.name==='name').at(-1);requireValue(attribute,'KAG_MACRO_NAME');nodes.push({kind:'macro',header:t,name:attribute.mode==='literal'?literalArg(t,'name').toLowerCase():null,template,source:t.source});continue;}
   if(t.name==='ignore'){const children=body(new Set(['endignore']),depth+1,inMacro),end=tokens[cursor++];requireValue(end?.kind==='tag'&&end.name==='endignore',`KAG_UNCLOSED_IGNORE ${file}:${t.source.line}`);nodes.push({kind:'ignore',header:t,body:children,source:t.source});continue;}
   nodes.push(t);
  }return nodes;
 }
 const nodes=body(new Set(),0,false),labels:LabelSymbol[]=[],counts=new Map<string,number>();let previous='';
 for(const t of tokens)if(t.kind==='label'){const declared=t.name||previous;requireValue(declared,`KAG_FIRST_LABEL_EMPTY ${file}:${t.source.line}`);previous=declared;const occurrence=(counts.get(declared)??0)+1;counts.set(declared,occurrence);labels.push({declaredName:t.name,name:occurrence===1?declared:`${declared}:${occurrence}`,occurrence,source:t.source});}
 requireValue(new Set(labels.map(l=>l.name)).size===labels.length,'KAG_LABEL_ALIAS_COLLISION');return {file,nodes,labels,tokens:tokens.length,controlProfile};
}
export function* walk(nodes:readonly KagNode[],conditional=false,owner:string|null=null):Generator<{node:KagNode;conditional:boolean;owner:string|null}> {for(const node of nodes){yield {node,conditional,owner};if(node.kind==='conditional')for(const arm of node.arms)yield*walk(arm.body,true,owner);else if(node.kind==='ignore')yield*walk(node.body,true,owner);else if(node.kind==='macro'){let depth=0;for(const token of node.template){if(token.kind==='tag'&&['if','ignore'].includes(token.name))depth++;yield {node:token,conditional:conditional||depth>0,owner:node.name??'<dynamic>'};if(token.kind==='tag'&&['endif','endignore'].includes(token.name))depth=Math.max(0,depth-1);}}}}
