import {compressStatic} from './compress-static.js';
import {cp,mkdir,rm,readdir,readFile} from 'node:fs/promises';
import path from 'node:path';
import {hash} from './locale.js';
const build=process.argv[3]??'dist';if(!['dist','dist.next'].includes(build))throw new Error('Expected a local build directory');
const target=process.argv[2]??'preview';if(target!=='preview'&&target!=='regression')throw new Error('Expected preview or regression');
console.log('Static protobuf compression',await compressStatic(build));
const root='generated/edge-'+target;await rm(root,{recursive:true,force:true});await mkdir(root,{recursive:true});
async function copy(dir:string){for(const e of await readdir(build+'/'+dir,{withFileTypes:true})){const name=path.posix.join(dir,e.name);if(/^assets\/(shared|locales)(\/|$)/u.test(name))continue;if(e.isDirectory()){await mkdir(root+'/'+name,{recursive:true});await copy(name);}else{if(!/\.(html|js|css|pb|ico|pb\.br)$/u.test(name))throw new Error('Unexpected edge asset '+name);await cp(build+'/'+name,root+'/'+name);}}}
await copy('');
const index=await readFile(root+'/index.html','utf8');console.log('Frontend/text prepared without R2 media; entry fingerprint '+hash(index));
