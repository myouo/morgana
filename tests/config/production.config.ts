import {defineConfig} from '@playwright/test';
import {fromRoot} from './paths.js';

const origin = process.env.FATA_PRODUCTION_ORIGIN ?? 'http://127.0.0.1:4260';
if (!['http://127.0.0.1:4260', 'https://fata.morgana.love'].includes(origin)) {
  throw new Error('Invalid formal origin');
}
const run = origin.startsWith('https:') ? 'remote' : 'local';

export default defineConfig({
  testDir: fromRoot('tests/smoke-browser'),
  metadata: {formal: true},
  timeout: 180_000,
  workers: 1,
  reporter: [['list'], ['json', {outputFile: fromRoot(`artifacts/browser/production/${run}.json`)}]],
  outputDir: fromRoot(`artifacts/browser/production/${run}`),
  use: {
    baseURL: origin,
    headless: true,
    viewport: {width: 1280, height: 960},
    trace: 'retain-on-failure',
  },
});
