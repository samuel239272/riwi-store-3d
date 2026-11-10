import { chromium } from '@playwright/test';
import { existsSync, writeFileSync } from 'node:fs';

const base = process.argv[2] || 'http://127.0.0.1:5173';
const browser = await chromium.launch({
  headless: true,
  executablePath: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/usr/bin/chromium',
  ].find(existsSync),
});
const report = [];
try {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      reducedMotion: 'no-preference',
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.addInitScript(() => sessionStorage.setItem('riwi.reborn.intro.v1', 'seen'));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      [...document.querySelectorAll('.world-clean,.mascot-sprite img')].every(
        (img) => img.complete && img.naturalWidth,
      ),
    );
    await page.waitForTimeout(1000);
    await page.screenshot({ path: `artifacts/motion-hero-${name}.png` });
    const mascot = page.getByRole('img', { name: /Mascota RIWI:/ });
    const initial = await mascot.boundingBox();
    const journey = [{ section: 'system-online', scrollY: 0, box: initial }];
    for (const id of ['select-loadout', 'code-collection', 'built-by-coders', 'deploy-identity']) {
      await page.evaluate((id) => {
        const target = document.getElementById(id);
        scrollTo({ top: scrollY + target.getBoundingClientRect().top - 80, behavior: 'instant' });
      }, id);
      await page.waitForTimeout(1200);
      await page.screenshot({ path: `artifacts/motion-${id}-${name}.png` });
      journey.push({
        section: id,
        scrollY: await page.evaluate(() => scrollY),
        box: await mascot.boundingBox(),
      });
    }
    await page.evaluate(() =>
      scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }),
    );
    await page.waitForTimeout(300);
    const end = await mascot.boundingBox();
    journey.push({ section: 'journey-end', scrollY: await page.evaluate(() => scrollY), box: end });
    await page.screenshot({ path: `artifacts/motion-journey-end-${name}.png` });
    report.push({
      name,
      base,
      errors,
      mascotMode: await mascot.getAttribute('data-mascot-mode'),
      mascotMonumental: initial.height > height * 1.8,
      mascotTravel: initial.y - end.y,
      mascotCentered: journey.every(({ box }) => Math.abs(box.x + box.width / 2 - width / 2) < 1),
      journey,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      layers: await page.evaluate(() =>
        Object.fromEntries(
          ['.tech-field', '.mascot-plane', '.reborn-interface'].map((selector) => [
            selector,
            getComputedStyle(document.querySelector(selector)).zIndex,
          ]),
        ),
      ),
    });
    await page.close();
  }
  writeFileSync('artifacts/motion-visual-check.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
