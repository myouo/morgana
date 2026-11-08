import {test, expect} from '@playwright/test';
import type {Page} from '@playwright/test';
import {readUI} from '../../tooling/po.js';
import {languages} from '../../tooling/locale.js';
import {localeInfo} from '../../src/locales.js';
import {menuWords} from '../../src/translations.js';

async function title(page: Page, locale: string) {
  await page.goto(`/?lang=${locale}&__test&renderer=canvas`);
  await expect(page.locator('[data-title-action=start]')).toBeVisible({timeout: 150_000});
}

async function reading(page: Page, locale: string) {
  await title(page, locale);
  await page.locator('[data-title-action=start]').click();
  for (let i = 0; i < 240; i++) {
    if (await page.locator('.source-quick-menu[data-stable=true]').count()) break;
    const advance = page.locator('.advance-surface');
    if (await advance.count()) await advance.click({position: {x: 5, y: 5}});
    else await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
  }
  await expect(page.locator('.source-quick-menu[data-stable=true]')).toHaveCount(1);
}

async function playback(page: Page) {
  return page.evaluate(() => window.__fataTest!.player()!.getSnapshot().playback);
}

async function textId(page: Page) {
  return page.evaluate(() => window.__fataTest!.player()!.capture().text?.textId);
}

for (const locale of languages) test(`@settings ${locale} unread permission persists and Reset clears it`, async ({page}, info) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  const words = menuWords(await readUI(localeInfo[locale].html));
  await title(page, locale);
  await page.locator('[data-title-action=config]').click();
  const permission = page.getByRole('checkbox', {name: words.skipUnread, exact: true});
  const option = await page.locator('.unread-skip-option').boundingBox();
  expect(option).not.toBeNull();
  for (const control of await page.locator('.menu-plane > .art-button,.locale-option').all()) {
    const other = await control.boundingBox();
    expect(other && option && option.x < other.x + other.width && option.x + option.width > other.x &&
      option.y < other.y + other.height && option.y + option.height > other.y).toBe(false);
  }
  expect(await page.locator('.unread-skip-option').evaluate(el => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
  await expect(permission).not.toBeChecked();
  await permission.check();
  await expect.poll(() => page.evaluate(() => window.__fataTest!.player()!.exportPreferences().playback.skipUnread)).toBe(true);
  if (locale === 'en' || locale === 'zh') await page.locator('.game').screenshot({path: info.outputPath('settings.png')});
  await page.reload();
  await expect(page.locator('[data-title-action=config]')).toBeVisible({timeout: 150_000});
  await page.locator('[data-title-action=config]').click();
  await expect(permission).toBeChecked();
  await page.getByRole('button', {name: words.reset, exact: true}).click();
  await expect(permission).not.toBeChecked();
  await expect.poll(() => page.evaluate(() => window.__fataTest!.player()!.exportPreferences().playback.skipUnread)).toBe(false);
  expect(errors).toEqual([]);
});

for (const locale of ['en', 'zh'] as const) test(`@touch ${locale} tap toggles skip and honors unread permission`, async ({page}, info) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  const words = menuWords(await readUI(localeInfo[locale].html));
  await reading(page, locale);
  expect(await page.evaluate(() => matchMedia('(hover:none) and (pointer:coarse)').matches)).toBe(true);
  const button = page.locator('[data-touch-skip]');
  await expect(button).toBeVisible();
  const box = await button.boundingBox(), game = await page.locator('.game').boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.x).toBeGreaterThanOrEqual(game!.x);
  expect(box!.x + box!.width).toBeLessThanOrEqual(game!.x + game!.width + .5);
  const before = await textId(page);
  await button.tap();
  await expect.poll(async () => (await playback(page)).reason).toBe('unread');
  expect(await textId(page)).toBe(before);
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await page.locator('[data-quick-action=settings]').tap();
  await page.getByRole('checkbox', {name: words.skipUnread, exact: true}).check();
  await expect.poll(() => page.evaluate(() => window.__fataTest!.player()!.exportPreferences().playback.skipUnread)).toBe(true);
  await page.getByRole('button', {name: words.back, exact: true}).tap();
  await button.tap();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => textId(page)).not.toBe(before);
  await page.locator('.game').screenshot({path: info.outputPath('touch-skip-active.png')});
  await button.tap();
  await expect.poll(async () => (await playback(page)).mode).toBe('manual');
  await expect(page.locator('.source-quick-menu[data-stable=true]')).toHaveCount(1, {timeout: 45_000});
  const stopped = await textId(page);
  await page.waitForTimeout(400);
  expect(await textId(page)).toBe(stopped);
  expect(errors).toEqual([]);
});

test('@desktop Ctrl stays held, releases to stop, and uses the same unread preference', async ({page}) => {
  const words = menuWords(await readUI('en'));
  await reading(page, 'en');
  await expect(page.locator('[data-touch-skip]')).toBeHidden();
  const before = await textId(page);
  await page.keyboard.down('ControlLeft');
  await expect.poll(async () => (await playback(page)).reason).toBe('unread');
  expect(await textId(page)).toBe(before);
  await page.keyboard.up('ControlLeft');
  await page.keyboard.press('Escape');
  await page.getByRole('button', {name: words.settings, exact: true}).click();
  await page.getByRole('checkbox', {name: words.skipUnread, exact: true}).check();
  await expect.poll(() => page.evaluate(() => window.__fataTest!.player()!.exportPreferences().playback.skipUnread)).toBe(true);
  await page.getByRole('button', {name: words.back, exact: true}).click();
  for (const key of ['ControlLeft', 'ControlRight']) {
    const text = await textId(page);
    await page.keyboard.down(key);
    await expect.poll(async () => (await playback(page)).mode).toBe('skip');
    await expect.poll(() => textId(page)).not.toBe(text);
    await page.keyboard.up(key);
    await expect.poll(async () => (await playback(page)).mode).toBe('manual');
    await expect(page.locator('.source-quick-menu[data-stable=true]')).toHaveCount(1, {timeout: 45_000});
  }
  await expect(page.locator('[data-touch-skip]')).toBeHidden();
});
