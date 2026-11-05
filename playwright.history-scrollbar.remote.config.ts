import {defineConfig} from '@playwright/test';
import base from './playwright.remote.config.js';
export default defineConfig({...base,testDir:'tests/history-scrollbar-browser',timeout:180000});
