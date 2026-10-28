import {mkdirSync} from 'node:fs';
import {defineConfig} from '@playwright/test';
mkdirSync('artifacts/browser',{recursive:true});
export default defineConfig({testDir:'tests/browser',timeout:45000,workers:1,fullyParallel:false,reporter:[['list'],['json',{outputFile:'artifacts/browser/results.json'}]],use:{baseURL:'http://127.0.0.1:4181',headless:true,viewport:{width:1280,height:950},launchOptions:{args:['--disable-webgl']},trace:'retain-on-failure'},webServer:{command:'pnpm exec vite preview --host 127.0.0.1',url:'http://127.0.0.1:4181',reuseExistingServer:false}});
