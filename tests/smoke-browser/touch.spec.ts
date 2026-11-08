import {test, expect} from '@playwright/test';
import {readUI} from '../../tooling/po.js';
import {menuWords} from '../../src/translations.js';

test.use({viewport: {width: 844, height: 390}, hasTouch: true, isMobile: true});

for (const locale of ['en', 'zh'] as const) test(`${locale} touch readers enable unread skip and toggle it through the actual UI`, async ({page}, info) => {
  test.setTimeout(300_000);
  const words = menuWords(await readUI(locale === 'zh' ? 'zh-Hans' : locale));
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`/?lang=${locale}&renderer=canvas`);
  await expect(page.locator('[data-title-action=config]')).toBeVisible({timeout: 150_000});
  await page.locator('[data-title-action=config]').tap();
  const permission = page.getByRole('checkbox', {name: words.skipUnread, exact: true});
  await permission.check();
  await page.getByRole('button', {name: words.back, exact: true}).tap();
  await page.locator('[data-title-action=start]').tap();
  for (let i = 0; i < 240; i++) {
    if (await page.locator('.source-quick-menu[data-stable=true]').count()) break;
    const advance = page.locator('.advance-surface');
    if (await advance.count()) await advance.tap({position: {x: 5, y: 5}});
    else await page.waitForTimeout(100);
    await page.waitForTimeout(150);
  }
  const button = page.locator('[data-touch-skip]');
  await expect(button).toBeVisible();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  const body = page.getByTestId('story-text');
  const before = await body.textContent();
  await button.tap();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => body.textContent()).not.toBe(before);
  await button.tap();
  await expect(button).toHaveAttribute('aria-pressed', 'false', {timeout: 45_000});
  expect(await page.evaluate(() => window.__fataTest)).toBeUndefined();
  expect(errors).toEqual([]);
  await page.locator('.game').screenshot({path: info.outputPath('touch-skip.png')});
});
