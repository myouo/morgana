import {fromRoot} from './paths.js';
import {defineConfig} from '@playwright/test';import base from "./remote.config.js";
process.env.FATA_LATE_COMPLETE='1';process.env.FATA_LATE_ALL='1';
export default defineConfig({...base,testDir:fromRoot('tests/history-late-resets-browser'),timeout:240000});
