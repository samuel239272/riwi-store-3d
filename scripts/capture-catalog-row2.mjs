import { chromium } from '@playwright/test';
import { launchOptions } from './qa-browser.mjs';

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1400, height: 1200 } });
await page.goto('http://127.0.0.1:5173/#/catalogo');
await page.waitForTimeout(2000);
await page.evaluate(() => window.scrollTo(0, 700));
await page.waitForTimeout(1000);

await page.screenshot({ path: 'scripts/preview_catalog_row2.png' });
console.log('Saved scripts/preview_catalog_row2.png');
await browser.close();

