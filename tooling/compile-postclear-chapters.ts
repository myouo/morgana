import {compileChapterDoor} from './compile-chapter-door.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
const wanted=process.argv[2]??'zh',chapter=process.argv[3]??'all';
requireValue(wanted==='all'||wanted.split(',').every(l=>languages.some(v=>v===l)),'POSTCLEAR_LOCALES');
requireValue(['all','door3','door4'].includes(chapter),'POSTCLEAR_CHAPTER');
for(const locale of languages.filter(l=>wanted==='all'||wanted.split(',').includes(l))){
 if(chapter!=='door4')await compileChapterDoor(locale,'door3',{cleared:true,outputRoot:'generated/postclear-third'});
 if(chapter!=='door3')await compileChapterDoor(locale,'door4',{cleared:true,complete:true,outputRoot:'generated/postclear-fourth'});
}
