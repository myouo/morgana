import {mkdir,writeFile} from 'node:fs/promises';
import {connectedRelease} from './connected-release.js';
import {nativeClearedMenu} from './native-cleared-menu.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
const wanted=process.argv[2]??'zh',selected=languages.filter(l=>wanted==='all'||wanted.split(',').includes(l));requireValue(selected.length>0&&(wanted==='all'||selected.length===wanted.split(',').length),'CLEARED_LOCALES');
for(const locale of selected){
 const project=await connectedRelease('generated/bonus-connected','generated/cleared-connected',locale),gallery=await project.addFragment('generated/gallery-full','gallery/','bitmap'),music=await project.addFragment('generated/music-full','music/','bitmap'),omake=await project.addFragment('generated/omake-full','backstage/','omake'),linked=[gallery,music,omake],objects=new Set(linked.flatMap(v=>v.linked.functions.flatMap(f=>f.code.flatMap(i=>i.op==='stage.image'||i.op==='stage.image.filtered'?[i.id]:i.op==='stage.put'?[i.object.id]:i.op==='stage.clone'?i.mapping.map(v=>v.to):[]))));
 const menu=await nativeClearedMenu(project.b,project.content,locale,project.header,project.functions(),[...objects]),result=await project.finish('cleared',['complete-prologue','omake'],true);await mkdir('artifacts/cleared-connected',{recursive:true});const report={locale,...result,components:linked.map(v=>v.release),...menu,scope:'original cleared title/six-button extras/main-authority gallery+music+backstage; cleared replay script variants remain pending'};await writeFile(`artifacts/cleared-connected/${locale}-compile.json`,JSON.stringify(report,null,2));console.log(report);
}
