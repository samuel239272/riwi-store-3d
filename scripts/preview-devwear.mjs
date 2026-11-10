import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';

const browser = await chromium.launch({
  headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/chromium'].find(path => existsSync(path)),
});
try {
  for (const [name, width, height] of [
    ['desktop', 1440, 900],
    ['mobile', 390, 844],
  ]) {
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
      reducedMotion: 'reduce',
    });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('http://127.0.0.1:5173');
    await page.evaluate(() => document.fonts.ready);
    await page.locator('.dev-hero-stage img').waitFor();
    await page.screenshot({ path: `artifacts/devwear-${name}.png` });
    await page.locator('.identity-section').scrollIntoViewIfNeeded();
    await page.locator('.source-collection').scrollIntoViewIfNeeded();
    await page.locator('.perspective-lab').scrollIntoViewIfNeeded();
    await page.locator('.next-version').scrollIntoViewIfNeeded();
    await page.locator('.dev-footer').scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `artifacts/devwear-${name}-full.png`, fullPage: true });
    console.log(
      JSON.stringify({
        name,
        errors,
        overflow: await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        ),
      }),
    );
    await page.close();
  }
} finally {
  await browser.close();
}
