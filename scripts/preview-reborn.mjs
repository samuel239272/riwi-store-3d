import { chromium } from '@playwright/test';
import { existsSync, writeFileSync } from 'node:fs';
const url = process.argv[2] || 'http://127.0.0.1:5173';
const browser = await chromium.launch({
  headless: true,
  executablePath: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/chromium',
  ].find(existsSync),
});
const report = [];
try {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('.world-clean,.mascot-sprite img')).every(
        (image) => image.complete && image.naturalWidth > 0,
      ),
    );
    await page.screenshot({ path: `artifacts/reborn-${name}-hero.png` });
    await page.getByRole('button', { name: 'Explorar tecnología JavaScript', exact: true }).click();
    await page.screenshot({ path: `artifacts/reborn-${name}-tech.png` });
    await page.keyboard.press('Escape');
    const checkpoints = [];
    for (const id of ['select-loadout', 'code-collection', 'built-by-coders', 'deploy-identity']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      const bounds = await page.getByRole('img', { name: /Mascota RIWI:/ }).boundingBox();
      checkpoints.push({
        id,
        mascot: bounds,
        overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      });
      await page.screenshot({ path: `artifacts/reborn-${name}-${id}.png` });
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `artifacts/reborn-${name}-full.png`, fullPage: true });
    report.push({ name, errors, checkpoints });
    await page.close();
  }
  writeFileSync('artifacts/reborn-visual-qa.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
