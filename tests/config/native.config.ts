import {fromRoot,projectRoot} from './paths.js';
import {defineConfig} from '@playwright/test';
import {readFileSync} from 'node:fs';
const port=4204;
const origin=process.env.FATA_NATIVE_ORIGIN,run=process.env.FATA_NATIVE_RUN??'local';
if(origin&&origin!=='https://testsdk.morgana.love')throw new Error('Native menu regression origin must be testsdk');
const auth=origin?(()=>{const raw=readFileSync('private/cloudflare/auth-header.txt','utf8').trim(),plain=Buffer.from(raw.replace(/^Basic /u,''),'base64').toString(),n=plain.indexOf(':');if(n<0)throw new Error('Regression auth');return {httpCredentials:{origin,username:plain.slice(0,n),password:plain.slice(n+1)}};})():{};
export default defineConfig({testDir:fromRoot('tests/native-browser'),timeout:180000,workers:1,reporter:[['list'],['json',{outputFile:fromRoot(`artifacts/native-connected/${run}-browser.json`)}]],outputDir:fromRoot(`artifacts/native-connected/${run}-traces`),use:{...auth,baseURL:origin??`http://127.0.0.1:${port}`,headless:true,viewport:{width:1280,height:960},trace:'retain-on-failure'},...(origin?{}:{webServer:{cwd:projectRoot,command:`FATA_MODULES=1 FATA_PUBLICATION_ROOT=generated/native-connected pnpm exec vite --host 127.0.0.1 --port ${port}`,url:`http://127.0.0.1:${port}`,reuseExistingServer:false}})});
