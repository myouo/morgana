import {execFileSync} from 'node:child_process';
import {readFile,mkdir,rename,rm,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=process.cwd(),sdk=path.join(root,'galbox'),update=process.argv.includes('--update');
const run=(command,args,cwd=sdk)=>execFileSync(command,args,{cwd,stdio:'inherit'});
let sourceRoot;try{sourceRoot=execFileSync('git',['rev-parse','--show-toplevel'],{cwd:sdk,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{throw new Error('Initialize the SDK with git submodule update --init galbox.');}
if(path.resolve(sourceRoot)!==sdk)throw new Error('Initialize the SDK with git submodule update --init galbox.');
const revision=execFileSync('git',['rev-parse','HEAD'],{cwd:sdk,encoding:'utf8'}).trim();
const dirty=execFileSync('git',['status','--porcelain','--untracked-files=normal'],{cwd:sdk,encoding:'utf8'}).trim();
if(dirty)throw new Error('Commit the galbox submodule source changes before packaging so the consumer can reproduce them.');
await mkdir('vendor',{recursive:true});const temporary=path.join(root,'vendor/.sdk-build.tgz');
try{
 run('pnpm',['install','--frozen-lockfile']);run('pnpm',['build:sdk']);run('pnpm',['--dir','packages/galbox-sdk','pack','--out',temporary]);
 const bytes=await readFile(temporary),sha=createHash('sha256').update(bytes).digest('hex'),file=`vendor/galbox-sdk-${sha.slice(0,12)}.tgz`,pkg=JSON.parse(await readFile('package.json','utf8'));
 if(!update&&pkg.dependencies['galbox-sdk']!==`file:${file}`)throw new Error(`SDK artifact differs from the recorded dependency (built ${sha}). Review the submodule commit, then use pnpm sdk:update to update the pin.`);
 await rename(temporary,path.join(root,file));
 if(update){pkg.dependencies['galbox-sdk']=`file:${file}`;await writeFile('package.json',JSON.stringify(pkg,null,2)+'\n');run('pnpm',['install'],root);}
 await writeFile('vendor/SDK_SOURCE.toml',`commit = "${revision}"\nsha256 = "${sha}"\nfile = "${file}"\n`);
 console.log(`SDK submodule ${revision}; artifact ${sha}; ${update?'dependency updated':'recorded dependency reproduced'}`);
}finally{await rm(temporary,{force:true});}
