import {mkdir,writeFile} from 'node:fs/promises';
import {connectedRelease} from './connected-release.js';
import {nativeEndingBonus} from './native-ending-bonus.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';

const wanted=process.argv[2]??'zh',selected=languages.filter(l=>wanted==='all'||wanted.split(',').includes(l));requireValue(selected.length>0&&(wanted==='all'||selected.length===wanted.split(',').length),'BONUS_CONNECTED_LOCALES');
for(const locale of selected){
 const project=await connectedRelease('generated/native-connected','generated/bonus-connected',locale),fragment=await project.addFragment('generated/complete-prologue-full','bonus/'),objects=new Set(fragment.linked.functions.flatMap(f=>f.code.flatMap(i=>i.op==='stage.image'||i.op==='stage.image.filtered'?[i.id]:i.op==='stage.put'?[i.object.id]:i.op==='stage.clone'?i.mapping.map(m=>m.to):[]))),menu=await nativeEndingBonus(project.b,project.content,locale,project.header,project.functions(),[...objects]);
 const result=await project.finish('bonus',['complete-prologue']);await mkdir('artifacts/bonus-connected',{recursive:true});const report={locale,...result,donor:fragment.release,...menu,scope:'original all-ending unlock and main-authority bonus prologue; full cleared extras still pending'};await writeFile(`artifacts/bonus-connected/${locale}-compile.json`,JSON.stringify(report,null,2));console.log(report);
}
