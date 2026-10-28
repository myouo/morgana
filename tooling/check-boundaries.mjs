import {execFileSync} from 'node:child_process';
import {realpath,readFile,readdir} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),installed=await realpath('node_modules/galbox-sdk');
if(!installed.startsWith(root+path.sep+'node_modules'+path.sep))throw new Error('SDK must be independently installed');
const pkg=JSON.parse(await readFile('package.json','utf8'));if(!pkg.dependencies['galbox-sdk'].startsWith('file:vendor/')||pkg.dependencies['galbox-sdk'].includes('workspace'))throw new Error('Expected a pinned local SDK tarball');
async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())await walk(file);else if(/\.(ts|tsx|mjs|py)$/.test(file)){const source=await readFile(file,'utf8');if(/(?:from\s*|import\s*\()['"][^'"]*(?:galbox-sdk\/src|packages\/galbox-sdk|\.\.\/galbox-sdk)/.test(source))throw new Error('Private/workspace SDK import: '+file);}}}
for(const dir of ['src','tooling','tests'])await walk(dir);
const tracked=execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);if(tracked.some(f=>/^(private|public|artifacts|vendor|dist|generated|extracted|unpacked|.wrangler)\//.test(f)||/\.(xp3|exe|dll|ks|tjs|ogg|wav|mp3|png|jpg|jpeg|webp|mp4|webm|ttf|otf|tft|pimg|tlg|bmp|gif|psd|asd|sli|anm|avi|mpg|mkv|flac|dat|log|tgz)$/.test(f)))throw new Error('Game/generated data entered Git');
const ignored=execFileSync('git',['check-ignore','--no-index','private/probe.ks','public/probe.pb','artifacts/probe.log','vendor/sdk.tgz','generated/site/probe.pb','.wrangler/probe.log','.dev.vars','extracted/scenario.ks','unpacked/title.tjs','archive.xp3','layer.tlg','music.sli'],{encoding:'utf8'}).trim().split('\n');if(ignored.length!==12)throw new Error('Missing ignored boundary');
console.log('Independent SDK dependency and ignored game-data boundaries passed');

const submodule=execFileSync('git',['ls-files','--stage','galbox'],{encoding:'utf8'}).trim();if(!submodule.startsWith('160000 '))throw new Error('galbox must be a Git submodule, not copied SDK files');
const sourceURL=execFileSync('git',['config','-f','.gitmodules','--get','submodule.galbox.url'],{encoding:'utf8'}).trim();if(sourceURL!=='https://github.com/myouo/galbox.git')throw new Error('Unexpected SDK submodule source');
