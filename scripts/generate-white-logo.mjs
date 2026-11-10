import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'fs';
import { launchOptions } from './qa-browser.mjs';

const svgRaw = readFileSync('public/logos/riwi.svg', 'utf-8');
const svgAllWhite = svgRaw.replace(/fill="#[0-9a-fA-F]+"/g, 'fill="#ffffff"');
writeFileSync('public/logos/riwi-white.svg', svgAllWhite);

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 1468, height: 422 } });

await page.setContent(`
  <body style="margin:0;padding:0;background:transparent;overflow:hidden;">
    ${svgAllWhite}
  </body>
`);

const logoBuffer = await page.screenshot({ omitBackground: true });
writeFileSync('public/logos/riwi-white.png', logoBuffer);
console.log('Saved public/logos/riwi-white.svg and public/logos/riwi-white.png');

await browser.close();
