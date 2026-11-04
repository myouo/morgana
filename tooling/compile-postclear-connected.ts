import {mkdir,writeFile} from 'node:fs/promises';
import {connectedRelease} from './connected-release.js';
import {languages} from './locale.js';
import {bool} from 'galbox-sdk/protocol';
import {postclearInterlude,postclearRoutes} from './postclear-routes.js';
for(const locale of languages.filter(l=>process.argv[2]==='all'||(process.argv[2]??'zh').split(',').includes(l))){
 const project=await connectedRelease('generated/cleared-connected','generated/postclear-connected',locale),specs=[['prelude','generated/postclear-prelude'],['first','generated/postclear-first'],['second','generated/postclear-second'],['third','generated/postclear-third'],['search','generated/postclear-search'],['fourth','generated/postclear-fourth']]as const,donors=[];
 for(const [name,root]of specs){console.log({locale,fragment:name});donors.push({name,...await project.addFragment(root,'postclear-'+name+'/',undefined,name==='search')});}
 const routes=[['main:prologue','postclear-prelude/main'],['main:door1','postclear-first/main'],['integration:chapter2','postclear-second/main'],['integration:chapter3','postclear-third/main'],['search:enter','postclear-search/main'],['search:fourth','postclear-fourth/main']]as const;
 project.b.global({id:postclearInterlude,kind:'bool',initial:bool(false)});
 postclearRoutes(project.functions(),routes.map(([at,target],n)=>({at,target,...(n===1?{withInterlude:true}:{})})));
 const result=await project.finish('postclear',['complete-prologue','omake'],false);await mkdir('artifacts/postclear-connected',{recursive:true});const report={locale,...result,donors:donors.map(d=>({name:d.name,release:d.release})),routes:routes.map(([at,target])=>({at,target})),scope:'source fataend switches both new-game and original chapter entries; old ordinary bodies retained; full route verification pending'};await writeFile(`artifacts/postclear-connected/${locale}-compile.json`,JSON.stringify(report,null,2));console.log(report);
}
