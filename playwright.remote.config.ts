import {defineConfig} from '@playwright/test';
import {readFileSync,mkdirSync} from 'node:fs';
const auth=readFileSync('private/cloudflare/auth-header.txt','utf8').trim(),plain=Buffer.from(auth.replace(/^Basic /u,''),'base64').toString(),index=plain.indexOf(':');if(index<0)throw new Error('Missing local test credentials');mkdirSync('artifacts/remote',{recursive:true});
const run=process.env.MORGANA_RUN??'post-cache';if(!/^[a-z0-9-]+$/u.test(run))throw new Error('Invalid evidence run name');
export default defineConfig({testDir:'tests/browser',timeout:90000,workers:1,fullyParallel:false,reporter:[['list'],['json',{outputFile:`artifacts/remote/${run}-results.json`}]],outputDir:`artifacts/remote/${run}-test-results`,use:{baseURL:'https://testsdk.morgana.love',httpCredentials:{username:plain.slice(0,index),password:plain.slice(index+1)},headless:true,viewport:{width:1280,height:950},launchOptions:{args:['--disable-webgl']},trace:'retain-on-failure'}});
