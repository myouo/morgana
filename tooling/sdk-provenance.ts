import {readFile} from 'node:fs/promises';
import {parse} from 'smol-toml';
import {createCore} from 'galbox-sdk/core';
import {hash} from './locale.js';
import {requireValue} from './kag.js';
/** Capture before a long verifier starts, so a later dependency update cannot relabel old evidence. */
export async function sdkProvenance(){
 const pkg:unknown=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8')),source=parse(await readFile(new URL('../vendor/SDK_SOURCE.toml',import.meta.url),'utf8'));
 requireValue(pkg&&typeof pkg==='object'&&'dependencies'in pkg&&pkg.dependencies&&typeof pkg.dependencies==='object'&&'galbox-sdk'in pkg.dependencies,'SDK_PROVENANCE_PACKAGE');requireValue(typeof source.commit==='string'&&/^[a-f0-9]{40}$/u.test(source.commit)&&typeof source.sha256==='string'&&/^[a-f0-9]{64}$/u.test(source.sha256)&&typeof source.file==='string'&&source.file===`vendor/galbox-sdk-${source.sha256.slice(0,12)}.tgz`&&pkg.dependencies['galbox-sdk']==='file:'+source.file,'SDK_PROVENANCE_PIN');
 requireValue(hash(await readFile(new URL('../'+source.file,import.meta.url)))===source.sha256,'SDK_PROVENANCE_TAR');const exported=import.meta.resolve('galbox-sdk/core'),loaded:typeof import('galbox-sdk/core')=await import(exported);requireValue(decodeURIComponent(exported).includes(source.file.slice('vendor/'.length))&&loaded.createCore===createCore,'SDK_PROVENANCE_RUNTIME');return {commit:source.commit,sha256:source.sha256,file:source.file};
}
