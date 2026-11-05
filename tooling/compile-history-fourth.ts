import {compileChapterDoor} from './compile-chapter-door.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
const selected=process.argv[2]??'zh';requireValue(selected==='all'||selected.split(',').every(l=>languages.some(v=>v===l)),'HISTORY_FOURTH_LOCALE');
for(const locale of languages.filter(l=>selected==='all'||selected.split(',').includes(l)))await compileChapterDoor(locale,'door4',{complete:true,historyNotes:true,outputRoot:'generated/history-fourth',uiRoot:'generated/integrated'});
