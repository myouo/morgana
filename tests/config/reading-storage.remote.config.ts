import {fromRoot} from './paths.js';
import {defineConfig} from '@playwright/test';import base from "./remote.config.js";
export default defineConfig({...base,testDir:fromRoot('tests/history-retention-browser'),timeout:240000});
