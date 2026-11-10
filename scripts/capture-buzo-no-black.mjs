import { chromium } from '@playwright/test';
import { launchOptions } from './qa-browser.mjs';

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1200, height: 800 } });
await page.goto('http://127.0.0.1:5173/#/producto/buzo-loop');
await page.waitForTimeout(3000);

await page.screenshot({ path: 'scripts/preview_buzo_no_black.png' });
console.log('Saved scripts/preview_buzo_no_black.png');
await browser.close();

