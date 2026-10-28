import {richText as R} from 'galbox-sdk/port-kit';
import type {RichTextSourceRun} from 'galbox-sdk/protocol';
import {literalArg,strictArgs,requireValue} from './kag.js';
import type {KagNode} from './kag-ast.js';
export interface LiteralTextStream {content:string;runs:RichTextSourceRun[];confirmations:number;}
/** Lower only a verified literal body. Speaker/layout/macro context is separate. */
export function lowerLiteralText(nodes:readonly KagNode[]):LiteralTextStream {
 const runs:RichTextSourceRun[]=[],parts:string[]=[];let confirmations=0;
 for(const node of nodes){if(node.kind==='text'){if(node.text){runs.push(R.text(node.text));parts.push(node.text);}continue;}
  if(node.kind!=='tag')throw new Error(`UNSUPPORTED_TEXT_NODE ${node.source.file}:${node.source.line} ${node.kind}`);
  switch(node.name){
   case 'c':{strictArgs(node,['text']);const text=literalArg(node,'text');requireValue(!/[\[\]]/u.test(text),'UNSUPPORTED_CENTER_MARKUP');runs.push(R.text(text));parts.push(text);break;}
   case 'r':strictArgs(node,[]);runs.push(R.br());parts.push('\n');break;
   case 'l':strictArgs(node,[]);runs.push(R.confirm());confirmations++;break;
   default:throw new Error(`UNSUPPORTED_TEXT_TAG ${node.source.file}:${node.source.line} [${node.name}]`);
  }
 }
 const content=parts.join('');requireValue(content.length>0&&content.length<=4096,'TEXT_STREAM_SIZE');return {content,runs,confirmations};
}
