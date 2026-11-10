import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { launchOptions } from './qa-browser.mjs';

const browser = await chromium.launch(launchOptions);
try {
  await mkdir('artifacts', { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  for (const [name, route] of [['home-desktop', '/'], ['product-desktop', '/#/producto/hoodie-compile'], ['catalog-desktop', '/#/catalogo']]) {
    await page.goto(`http://127.0.0.1:5173${route}`);
    await page.evaluate(() => document.fonts.ready);
    if (route.includes('producto')) await page.locator('[data-model-status="ready"]').waitFor();
    await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5173/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'artifacts/home-mobile.png', fullPage: true });
  console.log('Saved RIWI desktop/mobile captures in artifacts/');
} finally { await browser.close(); }
