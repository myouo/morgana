import {fromRoot} from './paths.js';
import {defineConfig} from '@playwright/test';import base from "./remote.config.js";
const use={...base.use,...(process.env.FATA_REMOTE_ORIGIN?{baseURL:process.env.FATA_REMOTE_ORIGIN}:{})};if(process.env.FATA_REMOTE_ORIGIN==='https://test.morgana.love')delete use.httpCredentials;
export default defineConfig({...base,use,testDir:fromRoot('tests/integration-remote'),timeout:180000,workers:1});
