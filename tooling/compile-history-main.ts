import {normalizeHistoryMainMetadata} from './normalize-history-main-metadata.js';
import {mkdir,writeFile} from 'node:fs/promises';
import {connectedRelease} from './connected-release.js';
import {mergeHistoryInstructions} from './merge-history-instructions.js';
import {languages} from './locale.js';
import {sdkProvenance} from './sdk-provenance.js';
const sdk=await sdkProvenance();
for(const locale of languages.filter(l=>(process.argv[2]??'zh').split(',').includes(l))){
 const project=await connectedRelease('generated/integrated','generated/history-main',locale),rows=[];
 for(const [root,prefix]of [['generated/history-fourth','fourth/'],['generated/history-postclear-fourth','postclear-fourth/']]as const){
  const replaced=await project.replaceFragment(root,prefix),merged=mergeHistoryInstructions(replaced.previous,replaced.linked.functions,project.manifest.header,project.header),byId=new Map(merged.functions.map(f=>[f.id,f]));for(const file of project.files)file.body.functions=file.body.functions.map(f=>byId.get(f.id)??f)as typeof file.body.functions;rows.push({prefix,donor:replaced.release,notes:merged.added});
 }
 const result=await project.finish('historymain',['complete-prologue','omake']);await normalizeHistoryMainMetadata('generated/history-main',locale);await mkdir('artifacts/history-main',{recursive:true});await writeFile(`artifacts/history-main/${locale}-compile.json`,JSON.stringify({locale,...result,sdk,rows,scope:'ordinary and cleared fourth history-only insertion; original instruction/call/return/collection ABI preserved; other content unchanged'},null,2));console.log({locale,...result,rows});
}
