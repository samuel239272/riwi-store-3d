import { chromium } from '@playwright/test';
import { launchOptions } from './qa-browser.mjs';

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
await page.goto('http://127.0.0.1:5173/#/producto/buzo-loop');
await page.waitForTimeout(3000);

// Click "Frontal" preset
await page.locator('.camera-presets button:has-text("Frontal")').click();
await page.waitForTimeout(1000);

// Select "Crudo" color (cream/white)
await page.locator('button[aria-label="Color Crudo"]').click();
await page.waitForTimeout(1000);

const canvas = page.locator('canvas');
await canvas.screenshot({ path: 'scripts/preview_buzo_white_front.png' });
console.log('Saved scripts/preview_buzo_white_front.png');
await browser.close();
