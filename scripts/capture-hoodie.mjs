import { chromium } from '@playwright/test';
import { launchOptions } from './qa-browser.mjs';

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
await page.goto('http://127.0.0.1:5173/#/producto/hoodie-compile');
await page.waitForTimeout(3000);

// Select "Crudo" color (cream/white)
const buttons = page.locator('button');
const count = await buttons.count();
for (let i = 0; i < count; i++) {
  const text = await buttons.nth(i).innerText();
  if (text.includes('Crudo')) {
    await buttons.nth(i).click();
    await page.waitForTimeout(1000);
    break;
  }
}

const canvas = page.locator('canvas');
await canvas.screenshot({ path: 'scripts/preview_hoodie_left.png' });
console.log('Saved scripts/preview_hoodie_left.png');
await browser.close();

