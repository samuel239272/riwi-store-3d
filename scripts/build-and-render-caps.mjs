import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
import { launchOptions } from './qa-browser.mjs';

await mkdir('public/models/garments', { recursive: true });
await mkdir('public/images/products', { recursive: true });

const server = await createServer({
  server: { host: '127.0.0.1', port: 5184, strictPort: true },
  base: '/',
});
await server.listen();

let browser;
try {
  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));

  await page.goto('http://127.0.0.1:5184/scripts/caps-builder.html');
  await page.waitForFunction(() => window.ready === true);

  console.log('Building Cap 1 (Cap.obj + normal map)...');
  const cap1DataUrl = await page.evaluate(() => window.buildCap1());
  const cap1Buffer = Buffer.from(cap1DataUrl.split(',')[1], 'base64');
  await writeFile('public/models/garments/cap-snapback.glb', cap1Buffer);
  console.log(`Cap 1 exported: ${Math.round(cap1Buffer.length / 1024)} KB`);

  console.log('Building Cap 2 (baseballCap_test2psd.kmz)...');
  const cap2DataUrl = await page.evaluate(() => window.buildCap2());
  const cap2Buffer = Buffer.from(cap2DataUrl.split(',')[1], 'base64');
  await writeFile('public/models/garments/cap-baseball.glb', cap2Buffer);
  console.log(`Cap 2 exported: ${Math.round(cap2Buffer.length / 1024)} KB`);

  console.log('Rendering snapshots for Cap 1...');
  for (const view of ['front', 'back']) {
    const shot = await page.evaluate(
      ({ glbUrl, view, color }) => window.renderAssetGlb(glbUrl, view, color),
      { glbUrl: '/models/garments/cap-snapback.glb', view, color: '#a99aff' }
    );
    const buf = Buffer.from(shot.split(',')[1], 'base64');
    await writeFile(`public/images/products/gorra-commit-${view}.webp`, buf);
    console.log(`Rendered gorra-commit-${view}.webp (${Math.round(buf.length / 1024)} KB)`);
  }

  console.log('Rendering snapshots for Cap 2...');
  for (const view of ['front', 'back']) {
    const shot = await page.evaluate(
      ({ glbUrl, view, color }) => window.renderAssetGlb(glbUrl, view, color),
      { glbUrl: '/models/garments/cap-baseball.glb', view, color: '#e8e5da' }
    );
    const buf = Buffer.from(shot.split(',')[1], 'base64');
    await writeFile(`public/images/products/gorra-origin-${view}.webp`, buf);
    console.log(`Rendered gorra-origin-${view}.webp (${Math.round(buf.length / 1024)} KB)`);
  }

  console.log('Done building and rendering caps!');
} finally {
  await browser?.close();
  await server.close();
}
