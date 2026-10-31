import {compileChapterDoor} from './compile-chapter-door.js';
import {languages} from './locale.js';import type {Language} from './locale.js';import {requireValue} from './kag.js';
export const compileThirdDoor=(locale:Language)=>compileChapterDoor(locale,'door3');
if(process.argv[1]?.endsWith('/compile-third-door.ts'))try{const wanted=process.argv[2]??'zh';requireValue(wanted==='all'||languages.some(l=>l===wanted),'LOCALE');for(const l of languages.filter(l=>wanted==='all'||l===wanted))await compileThirdDoor(l);}catch(e){console.error(e instanceof Error?e.stack:String(e));process.exitCode=1;}
