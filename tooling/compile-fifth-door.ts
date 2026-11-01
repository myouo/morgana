import {compileChapterDoor} from './compile-chapter-door.js';
import {languages} from './locale.js';
import {requireValue} from './kag.js';
const selected=process.argv[2]??'zh';requireValue(selected==='all'||languages.some(l=>l===selected),'LOCALE');for(const locale of languages.filter(l=>selected==='all'||l===selected))await compileChapterDoor(locale,'door5');
