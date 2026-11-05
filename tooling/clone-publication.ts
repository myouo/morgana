import {mkdir,readdir,link,copyFile,stat} from 'node:fs/promises';import path from 'node:path';import {requireValue} from './kag.js';
/** Mutable entry documents get independent inodes; only content-addressed files share links. */
export async function clonePublication(from:string,to:string){
 const base=path.resolve('generated')+path.sep,a=path.resolve(from),b=path.resolve(to);requireValue(a.startsWith(base)&&b.startsWith(base)&&a!==b&&!b.startsWith(a+path.sep),'PUBLICATION_CLONE_ROOT');requireValue(!await stat(b).then(()=>true,error=>{if(error.code==='ENOENT')return false;throw error;}),'PUBLICATION_CLONE_EXISTS');
 async function copy(source:string,target:string){await mkdir(target,{recursive:true});for(const entry of await readdir(source,{withFileTypes:true})){const x=path.join(source,entry.name),y=path.join(target,entry.name);requireValue(!entry.isSymbolicLink(),'PUBLICATION_CLONE_SYMLINK');if(entry.isDirectory())await copy(x,y);else if(/^[a-f0-9]{64}\.[^.]+$/u.test(entry.name))await link(x,y);else await copyFile(x,y);}}
 await copy(a,b);
}
