import {compileChapterDoor} from './compile-chapter-door.js';
import {requireValue} from './kag.js';
import {languages} from './locale.js';
const wanted=process.argv[2]??'zh',selected=languages.filter(l=>wanted==='all'||wanted.split(',').includes(l));requireValue(selected.length>0&&(wanted==='all'||selected.length===wanted.split(',').length),'LATE_LOCALES');for(const l of selected)await compileChapterDoor(l,'door9');
