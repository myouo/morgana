import {defineConfig} from '@playwright/test';import base from './playwright.remote.config.js';
process.env.FATA_LATE_COMPLETE='1';process.env.FATA_LATE_ALL='1';
export default defineConfig({...base,testDir:'tests/history-late-resets-browser',timeout:240000});
