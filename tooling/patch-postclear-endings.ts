import {mkdir,writeFile} from 'node:fs/promises';
import {endingTitleReturn} from './ending-title-return.js';
import {connectedRelease} from './connected-release.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 const project=await connectedRelease('generated/postclear-connected','generated/postclear-fixed',locale),changed=[];
 for(const fn of project.functions().filter(f=>/^postclear-fourth\/ending-[123]-(three|two|last)$/u.test(f.id))){requireValue(fn.code.at(-1)?.at.endsWith(':return'),'POSTCLEAR_ENDING_RETURN');endingTitleReturn(fn.code);changed.push(fn.id);}
 requireValue(changed.length===5,'POSTCLEAR_ENDING_WRAPPERS');const result=await project.finish('postclearfix',['complete-prologue','omake']);await mkdir('artifacts/postclear-fixed',{recursive:true});await writeFile(`artifacts/postclear-fixed/${locale}-compile.json`,JSON.stringify({locale,...result,changed,scope:'five cleared fourth-door bad-ending exits set the existing title handoff flag; original call and successor addresses retained'},null,2));console.log({locale,...result,changed});
}
