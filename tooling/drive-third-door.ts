import {driveChapterDoor} from './drive-chapter-door.js';import type {Language} from './locale.js';import {languages} from './locale.js';
export const driveThirdDoor=(locale:Language)=>driveChapterDoor(locale,'door3');
if(process.argv[1]?.endsWith('/drive-third-door.ts'))try{for(const l of languages.filter(l=>process.argv[2]==='all'||l===(process.argv[2]??'zh')))await driveThirdDoor(l);}catch(e){console.error(e instanceof Error?e.stack:String(e));process.exitCode=1;}
