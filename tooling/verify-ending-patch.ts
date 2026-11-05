import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {decodeWire} from 'galbox-sdk/wire';
import {canonicalWireJSON} from 'galbox-sdk/protocol';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
const read=async(p:string)=>new Uint8Array(await readFile(p));
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 async function load(root:string){const manifest=decodeWire('ModuleManifest',await read(`${root}/programs/${locale}.modules.pb`)),functions=(await Promise.all(manifest.modules.map(async m=>decodeWire('ProgramModule',await read(root+'/'+m.uri))))).flatMap(m=>m.functions);return {manifest,functions};}
 const prior=await load('generated/postclear-connected'),target=await load('generated/postclear-fixed'),functions=new Map(target.functions.map(f=>[f.id,f])),changed=[];let calls=0;
 requireValue(canonicalWireJSON(prior.manifest.functionOrder)===canonicalWireJSON(target.manifest.functionOrder),'ENDING_PATCH_FUNCTION_ORDER');
 for(const old of prior.functions){const current=functions.get(old.id);requireValue(current,'ENDING_PATCH_FUNCTION');if(/^postclear-fourth\/ending-[123]-(three|two|last)$/u.test(old.id)){
   requireValue(current.entry===old.entry&&current.layout===old.layout&&current.code.length===old.code.length+1,'ENDING_PATCH_ABI');for(let n=0;n<old.code.length-1;n++)requireValue(canonicalWireJSON(current.code[n])===canonicalWireJSON(old.code[n]),'ENDING_PATCH_PREFIX');const before=old.code.at(-1)!,flag=current.code.at(-2)!,after=current.code.at(-1)!;requireValue(before.op==='control.return'&&flag.at===before.at&&flag.op==='value.set'&&flag.dest==='original.return-title'&&'literal'in flag.value&&flag.value.literal?.kind==='bool'&&flag.value.literal.value===true&&after.op==='control.return'&&after.at===before.at+'-title','ENDING_PATCH_EXIT');changed.push(old.id);
  }else requireValue(canonicalWireJSON(current)===canonicalWireJSON(old),'ENDING_PATCH_UNRELATED '+old.id);
  for(const [n,i]of old.code.entries())if(i.op==='control.call'){const index=current.code.findIndex(v=>v.at===i.at);requireValue(index>=0&&current.code[index+1]?.at===old.code[n+1]?.at,'ENDING_PATCH_CALL_RETURN '+i.at);calls++;}
 }
 requireValue(changed.length===5,'ENDING_PATCH_COUNT');const {release:_old,...oldHeader}=prior.manifest.header,{release:_new,...newHeader}=target.manifest.header;requireValue(canonicalWireJSON(oldHeader)===canonicalWireJSON(newHeader)&&canonicalWireJSON(prior.manifest.assetCatalogs)===canonicalWireJSON(target.manifest.assetCatalogs),'ENDING_PATCH_HEADER_RESOURCES');
 const report={locale,source:prior.manifest.header.release,release:target.manifest.header.release,changed,calls,allOtherFunctionsUnchanged:true,headersAndResourcesUnchanged:true,completed:true,scope:'only five known bad-ending wrapper exits change; original code prefixes/call successor addresses/entry ABI and all non-release header/catalog bytes remain'};await mkdir('artifacts/postclear-fixed',{recursive:true});await writeFile(`artifacts/postclear-fixed/${locale}-delta.json`,JSON.stringify(report,null,2));console.log(report);
}
