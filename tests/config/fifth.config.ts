import {fromRoot,projectRoot} from './paths.js';
import {readFileSync} from 'node:fs';
import {defineConfig} from '@playwright/test';
const origin=process.env.FATA_FIFTH_ORIGIN,root=process.env.FATA_FIFTH_ROOT??'generated/fifth-connected',run=process.env.FATA_FIFTH_RUN??'local';
if(origin&&origin!=='https://testsdk.morgana.love')throw new Error('Fifth-door regression origin must be testsdk');
const auth=origin?(()=>{const raw=readFileSync('private/cloudflare/auth-header.txt','utf8').trim(),plain=Buffer.from(raw.replace(/^Basic /u,''),'base64').toString(),n=plain.indexOf(':');if(n<0)throw new Error('Regression auth');return {httpCredentials:{origin,username:plain.slice(0,n),password:plain.slice(n+1)}};})():{};
export default defineConfig({testDir:fromRoot('tests/fifth-browser'),timeout:300000,workers:1,reporter:[['list'],['json',{outputFile:fromRoot(`artifacts/fifth-connected/${run}-browser.json`)}]],outputDir:fromRoot(`artifacts/fifth-connected/${run}-traces`),use:{...auth,baseURL:origin??'http://127.0.0.1:4196',headless:true,viewport:{width:1280,height:960},trace:'retain-on-failure'},...(origin?{}:{webServer:{cwd:projectRoot,command:`FATA_MODULES=1 FATA_PUBLICATION_ROOT=${root} pnpm exec vite --host 127.0.0.1 --port 4196`,url:'http://127.0.0.1:4196',reuseExistingServer:false}})});
