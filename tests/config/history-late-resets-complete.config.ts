import {fromRoot,projectRoot} from './paths.js';
import {defineConfig} from '@playwright/test';
process.env.FATA_LATE_COMPLETE='1';
export default defineConfig({testDir:fromRoot('tests/history-late-resets-browser'),timeout:180000,workers:1,reporter:[['list'],['json',{outputFile:fromRoot('artifacts/history-late-resets-complete/browser.json')}]],outputDir:fromRoot('artifacts/history-late-resets-complete/traces'),use:{baseURL:'http://127.0.0.1:4254',headless:true,viewport:{width:1280,height:960},trace:'retain-on-failure'},webServer:{cwd:projectRoot,command:'FATA_MODULES=1 FATA_PUBLICATION_ROOT=generated/integrated pnpm exec vite --force --host 127.0.0.1 --port 4254',url:'http://127.0.0.1:4254',reuseExistingServer:false}});
