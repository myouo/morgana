import {mkdir,writeFile} from 'node:fs/promises';
import {connectedRelease} from './connected-release.js';
import {checkRasterFunctions} from './check-raster-upgrade.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
import {linkRealtimeThirdSources} from './link-realtime-third-sources.js';
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 const project=await connectedRelease('generated/postclear-fixed','generated/realtime-cleared-connected',locale),fragment=await project.replaceFragment('generated/postclear-third-realtime','postclear-third/'),checked=checkRasterFunctions(fragment.previous,fragment.linked.functions);
 // Stable source addresses allow the existing sequence→raster saved-state
 // mapper. Do not remap story text, call stacks, prompts or elapsed clocks.
 const result=await project.finish('clearedrealtime',['complete-prologue','omake']);const linkedSources=await linkRealtimeThirdSources('generated/realtime-cleared-connected',locale,checked.imageAliases);await mkdir('artifacts/realtime-cleared-connected',{recursive:true});const report={locale,...result,donor:fragment.release,requiredFunctions:checked.requiredFunctions,imageAliases:checked.imageAliases,linkedSources,compatibility:'original same-address sequence/raster migration; old resource catalog retained for cold-state validation',scope:'replace only cleared third code; original other story bodies retained'};await writeFile(`artifacts/realtime-cleared-connected/${locale}-compile.json`,JSON.stringify(report,null,2));console.log(report);
}
