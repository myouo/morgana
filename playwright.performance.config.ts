import {defineConfig} from '@playwright/test';
import interfaces from './playwright.interactions.config.js';
export default defineConfig(interfaces,{testDir:'tests/performance-browser',reporter:[['list'],['json',{outputFile:`artifacts/load-profile/${process.env.FATA_LOAD_RUN??'profile'}-results.json`}]],outputDir:`artifacts/load-profile/${process.env.FATA_LOAD_RUN??'profile'}-traces`});
