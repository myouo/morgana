import {defineConfig} from '@playwright/test';
import {fromRoot, projectRoot} from './paths.js';

export default defineConfig({
  testDir: fromRoot('tests/smoke-browser'),
  timeout: 180_000,
  workers: 1,
  reporter: [['list'], ['json', {outputFile: fromRoot('artifacts/browser/local.json')}]],
  outputDir: fromRoot('artifacts/browser/local'),
  use: {
    baseURL: 'http://127.0.0.1:4261',
    headless: true,
    viewport: {width: 1280, height: 960},
    trace: 'retain-on-failure',
  },
  webServer: {
    cwd: projectRoot,
    command: 'pnpm exec tsx tooling/refresh-interface-text.ts && FATA_MODULES=1 pnpm exec vite --host 127.0.0.1 --port 4261',
    url: 'http://127.0.0.1:4261',
    reuseExistingServer: false,
  },
});
