import { chromium } from '@playwright/test';
import { launchOptions } from './qa-browser.mjs';

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

await page.goto('http://127.0.0.1:5173/#/producto/camiseta-source');
await page.waitForTimeout(2000);

// Now in this working Three context, let's load /models/garments/jacket.glb
const res = await page.evaluate(async () => {
  return new Promise((resolve) => {
    // Look for THREE or load it
    const canvas = document.querySelector('canvas');
    if (!canvas) return resolve('No canvas found');
    
    // Fetch jacket.glb
    fetch('/models/garments/jacket.glb')
      .then(r => r.arrayBuffer())
      .then(buf => {
        resolve({ ok: true, size: buf.byteLength });
      })
      .catch(err => resolve({ ok: false, err: err.message }));
  });
});

console.log('Fetch result:', res);
await browser.close();

