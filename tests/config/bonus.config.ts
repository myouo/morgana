import {fromRoot,projectRoot} from './paths.js';
import {readFileSync} from 'node:fs';
import {defineConfig} from '@playwright/test';
const port=4206,origin=process.env.FATA_BONUS_ORIGIN,run=process.env.FATA_BONUS_RUN??'local';
if(origin&&origin!=='https://testsdk.morgana.love')throw new Error('Bonus regression origin must be testsdk');
const auth=origin?(()=>{const raw=readFileSync('private/cloudflare/auth-header.txt','utf8').trim(),plain=Buffer.from(raw.replace(/^Basic /u,''),'base64').toString(),n=plain.indexOf(':');if(n<0)throw new Error('Regression auth');return {httpCredentials:{origin,username:plain.slice(0,n),password:plain.slice(n+1)}};})():{};
export default defineConfig({testDir:fromRoot('tests/bonus-browser'),timeout:240000,workers:1,reporter:[['list'],['json',{outputFile:fromRoot(`artifacts/bonus-connected/${run}-browser.json`)}]],outputDir:fromRoot(`artifacts/bonus-connected/${run}-traces`),use:{...auth,baseURL:origin??`http://127.0.0.1:${port}`,headless:true,viewport:{width:1280,height:960},trace:'retain-on-failure'},...(origin?{}:{webServer:{cwd:projectRoot,command:`FATA_MODULES=1 FATA_PUBLICATION_ROOT=generated/bonus-connected pnpm exec vite --host 127.0.0.1 --port ${port}`,url:`http://127.0.0.1:${port}`,reuseExistingServer:false}})});
