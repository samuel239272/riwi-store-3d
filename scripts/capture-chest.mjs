import { chromium } from '@playwright/test';
import { launchOptions } from './qa-browser.mjs';
import fs from 'node:fs';

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });

await page.goto('http://127.0.0.1:5173/#/producto/camiseta-source');
await page.waitForTimeout(3000);

// Zoom in onto chest
const canvas = page.locator('canvas');
await canvas.screenshot({ path: 'scripts/chest_preview.png' });
console.log('Saved scripts/chest_preview.png');

await browser.close();

