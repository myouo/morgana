import {compileChapterDoor} from './compile-chapter-door.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
const wanted=process.argv[2]??'zh';requireValue(wanted==='all'||wanted.split(',').every(l=>languages.some(v=>v===l)),'REALTIME_THIRD_LOCALE');
for(const locale of languages.filter(l=>wanted==='all'||wanted.split(',').includes(l)))await compileChapterDoor(locale,'door3',{cleared:true,procedural:true,outputRoot:'generated/postclear-third-realtime'});
