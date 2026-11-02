import {defineConfig} from '@playwright/test';
if(process.env.FATA_INTERFACE_ORIGIN)throw new Error('Performance fixtures run only in the isolated local browser');
const root=process.env.FATA_INTERFACE_ROOT??'generated/integrated',run=process.env.FATA_LOAD_RUN??'profile';
export default defineConfig({testDir:'tests/performance-browser',timeout:600000,workers:1,reporter:[['list'],['json',{outputFile:`artifacts/load-profile/${run}-results.json`}]],outputDir:`artifacts/load-profile/${run}-traces`,use:{baseURL:'http://127.0.0.1:4194',headless:true,viewport:{width:1280,height:960},trace:'retain-on-failure'},webServer:{command:`FATA_MODULES=1 FATA_PUBLICATION_ROOT=${root} pnpm exec vite --host 127.0.0.1 --port 4194`,url:'http://127.0.0.1:4194',reuseExistingServer:true}});
