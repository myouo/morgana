import {compileChapterDoor} from './compile-chapter-door.js';
import {languages} from './locale.js';
for(const locale of languages.filter(l=>process.argv[2]==='all'||l===(process.argv[2]??'zh')))await compileChapterDoor(locale,'door7');
