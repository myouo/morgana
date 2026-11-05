import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {sourceHistoryProfile,historyAnnotation} from './source-history-profile.js';
import {chapters} from './chapter-catalog.js';
import {languages} from './locale.js';
import {tokenize} from './kag.js';
const rows=[];
for(const locale of languages){const profile=await sourceHistoryProfile(locale),counts={hisout:0,hisname:0},unsupported=[],sourceIssues=[];let characters=0,maxCharacters=0;for(const file of new Set(chapters.map(c=>c.file))){const text=await readFile(`private/text/${locale}/scenario/${file}`,'utf8');for(const tag of tokenize(text,file)){if(tag.kind!=='tag'||tag.name!=='hisout'&&tag.name!=='hisname')continue;counts[tag.name]++;try{const note=historyAnnotation(tag,profile);characters+=note.text.length;maxCharacters=Math.max(maxCharacters,note.text.length);if('sourceIssue'in note&&note.sourceIssue)sourceIssues.push({file,line:tag.source.line,code:note.sourceIssue});}catch(error){unsupported.push({file,line:tag.source.line,tag:tag.name,reason:String(error)});}}}rows.push({locale,profile,counts,characters,maxCharacters,sourceIssues,unsupported});}
await mkdir('artifacts/history-annotations',{recursive:true});await writeFile('artifacts/history-annotations/source-plan.json',JSON.stringify({rows,scope:'static authored tags, not runtime execution counts; append/output state/style and line modes must remain distinct'},null,2));console.log(rows.map(r=>({locale:r.locale,counts:r.counts,unsupported:r.unsupported.length,wrapping:r.profile.wrapping,maxLines:r.profile.maxLines})));
