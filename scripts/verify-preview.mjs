import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { launchOptions } from './qa-browser.mjs';

const browser = await chromium.launch(launchOptions);
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [320, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/#/catalogo', '/#/producto/hoodie-compile', '/#/carrito']) {
      await page.goto(`http://127.0.0.1:5173${route}`);
      await page.evaluate(() => document.fonts.ready);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Overflow at ${width}px: ${route}`);
    }
    console.log(`PASS: home, catalog, detail and cart at ${width}px`);
  }
  await page.goto('http://127.0.0.1:5173/#/producto/hoodie-compile');
  await page.locator('[data-model-status="ready"]').waitFor();
  await page.getByRole('button', { name: 'Posterior', exact: true }).click();
  await page.waitForFunction(() => Number(document.querySelector('canvas')?.dataset.cameraPosition?.split(',')[2]) < -4);
  assert.deepEqual(errors, []);
  console.log('PASS: smooth 3D camera transition; no page errors');
} finally { await browser.close(); }
