import {fromRoot,projectRoot} from './paths.js';
import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:fromRoot('tests/gallery-browser'),workers:1,timeout:240000,reporter:[['list'],['json',{outputFile:fromRoot('artifacts/gallery/browser.json')}]],outputDir:fromRoot('artifacts/gallery/traces'),use:{baseURL:'http://127.0.0.1:4208',headless:true,viewport:{width:1280,height:960},trace:'retain-on-failure'},webServer:{cwd:projectRoot,command:'pnpm exec vite --config tests/gallery-app/vite.config.ts',url:'http://127.0.0.1:4208',reuseExistingServer:false}});
