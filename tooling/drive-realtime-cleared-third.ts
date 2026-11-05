import {driveChapterDoor} from './drive-chapter-door.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
const wanted=process.argv[2]??'zh';requireValue(wanted==='all'||wanted.split(',').every(l=>languages.some(v=>v===l)),'REALTIME_THIRD_LOCALE');
for(const locale of languages.filter(l=>wanted==='all'||wanted.split(',').includes(l)))await driveChapterDoor(locale,'door3',{root:'generated/postclear-third-realtime',cleared:true,reportPrefix:'realtime-'});
