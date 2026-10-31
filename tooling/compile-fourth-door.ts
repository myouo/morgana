import {compileChapterDoor} from './compile-chapter-door.js';
import {languages} from './locale.js';import {requireValue} from './kag.js';
try{const wanted=process.argv[2]??'zh';requireValue(wanted==='all'||languages.some(l=>l===wanted),'LOCALE');for(const l of languages.filter(l=>wanted==='all'||l===wanted))await compileChapterDoor(l,'door4',{complete:!process.argv.includes('--main-only'),outputRoot:process.argv.includes('--main-only')?'generated/door4-full':'generated/door4-next'});}catch(e){console.error(e instanceof Error?e.stack:String(e));process.exitCode=1;}
