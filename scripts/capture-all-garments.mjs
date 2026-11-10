import { chromium } from '@playwright/test';
import { launchOptions } from './qa-browser.mjs';

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });

for (const id of ['hoodie-compile', 'buzo-loop', 'gorra-commit', 'chaqueta-deploy']) {
  await page.goto(`http://127.0.0.1:5173/#/producto/${id}`);
  await page.waitForTimeout(2500);
  const canvas = page.locator('canvas');
  await canvas.screenshot({ path: `scripts/preview_${id}.png` });
  console.log(`Saved scripts/preview_${id}.png`);
}

await browser.close();

