import {driveChapterDoor} from './drive-chapter-door.js';import {languages} from './locale.js';
try{for(const locale of languages.filter(l=>process.argv[2]==='all'||l===(process.argv[2]??'zh')))await driveChapterDoor(locale,'door5');}catch(error){console.error(error instanceof Error?error.stack:String(error));process.exitCode=1;}
