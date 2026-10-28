import {readdir,readFile,writeFile} from 'node:fs/promises';
import {brotliCompressSync,brotliDecompressSync,constants} from 'node:zlib';
import {requireValue} from './kag.js';
/** Lossless transport variants; release identity remains the decoded protobuf. */
export async function compressStatic(root:string){
 let files=0,rawBytes=0,encodedBytes=0;
 async function walk(dir:string){for(const entry of await readdir(root+'/'+dir,{withFileTypes:true})){const path=dir+'/'+entry.name;if(entry.isDirectory())await walk(path);else if(entry.name.endsWith('.pb')){const raw=await readFile(root+'/'+path);requireValue(raw.length<=32*1024*1024,'STATIC_PROTOBUF_LIMIT');const encoded=brotliCompressSync(raw,{params:{[constants.BROTLI_PARAM_QUALITY]:7}});requireValue(brotliDecompressSync(encoded).equals(raw),'STATIC_COMPRESSION_ROUNDTRIP');await writeFile(root+'/'+path+'.br',encoded);files++;rawBytes+=raw.length;encodedBytes+=encoded.length;}}}
 for(const dir of ['programs','text'])await walk(dir);
 return {files,rawBytes,encodedBytes};
}
if(process.argv[1]?.endsWith('/compress-static.ts'))console.log('Static protobuf compression',await compressStatic(process.argv[2]??'dist'));
