import { chromium } from '@playwright/test';
import { launchOptions } from './qa-browser.mjs';

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
page.on('response', res => {
  if (res.status() >= 400) {
    console.error('HTTP', res.status(), res.url());
  }
});

await page.goto('http://127.0.0.1:5173/#/producto/chaqueta-deploy');
await page.waitForTimeout(4000);

await browser.close();
