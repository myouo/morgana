import {defineConfig} from '@playwright/test';
import {fromRoot, projectRoot} from './paths.js';

export default defineConfig({
  testDir: fromRoot('tests/touch-skip-browser'),
  timeout: 240_000,
  workers: 2,
  reporter: [['list'], ['json', {outputFile: fromRoot('artifacts/touch-skip-2026-11-08/browser.json')}]],
  outputDir: fromRoot('artifacts/touch-skip-2026-11-08/traces'),
  use: {baseURL: 'http://127.0.0.1:4263', headless: true, trace: 'retain-on-failure'},
  projects: [
    {name: 'desktop', grep: /@(settings|desktop)/, use: {viewport: {width: 1280, height: 960}}},
    {name: 'portrait-touch', grep: /@touch/, use: {viewport: {width: 390, height: 844}, hasTouch: true, isMobile: true}},
    {name: 'landscape-touch', grep: /@touch/, use: {viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true}},
  ],
  webServer: {
    cwd: projectRoot,
    command: 'pnpm exec tsx tooling/refresh-interface-text.ts && FATA_MODULES=1 pnpm exec vite --host 127.0.0.1 --port 4263',
    url: 'http://127.0.0.1:4263',
    reuseExistingServer: false,
  },
});
