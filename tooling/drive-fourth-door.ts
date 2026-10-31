import {driveChapterDoor} from './drive-chapter-door.js';import {languages} from './locale.js';
try{for(const l of languages.filter(l=>process.argv[2]==='all'||l===(process.argv[2]??'zh')))await driveChapterDoor(l,'door4');}catch(e){console.error(e instanceof Error?e.stack:String(e));process.exitCode=1;}
