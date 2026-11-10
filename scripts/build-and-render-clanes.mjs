import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { writeFile, mkdir } from 'node:fs/promises';
import { launchOptions } from './qa-browser.mjs';

await mkdir('public/models/garments', { recursive: true });
await mkdir('public/images/products', { recursive: true });

const server = await createServer({
  server: { host: '127.0.0.1', port: 5190, strictPort: true },
  base: '/',
});
await server.listen();

const clanes = [
  { clan: 'ubuntu', targetH: 0.80, crop: { cropW: 857, cropH: 959, minX: 83, minY: 37 } },
  { clan: 'ritchie', targetH: 0.76, crop: { cropW: 692, cropH: 678, minX: 168, minY: 45 } },
  { clan: 'nakamoto', targetH: 0.82, crop: { cropW: 422, cropH: 552, minX: 300, minY: 16 } },
  { clan: 'turing', targetH: 0.80, crop: { cropW: 950, cropH: 1011, minX: 51, minY: 13 } },
  { clan: 'vanrossum', targetH: 0.80, crop: { cropW: 918, cropH: 978, minX: 52, minY: 10 } },
  { clan: 'gosling', targetH: 0.80, crop: { cropW: 863, cropH: 979, minX: 81, minY: 5 } },
  { clan: 'tesla', targetH: 0.80, crop: { cropW: 594, cropH: 711, minX: 213, minY: 23 } },
];

let browser;
try {
  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.goto('http://127.0.0.1:5190/scripts/clanes-builder.html');
  await page.waitForFunction(() => window.ready === true);

  for (const item of clanes) {
    console.log(`[1/3] Building tee-${item.clan}.glb...`);
    const glbDataUrl = await page.evaluate(
      ({ c, crop, targetH }) => window.buildClanTee(c, crop, targetH),
      { c: item.clan, crop: item.crop, targetH: item.targetH }
    );
    const glbBuffer = Buffer.from(glbDataUrl.split(',')[1], 'base64');
    await writeFile(`public/models/garments/tee-${item.clan}.glb`, glbBuffer);
    console.log(`✓ Exported public/models/garments/tee-${item.clan}.glb (${Math.round(glbBuffer.length / 1024)} KB)`);

    console.log(`[2/3] Rendering catalog front & back for camiseta-clan-${item.clan}...`);
    for (const view of ['front', 'back']) {
      const snapDataUrl = await page.evaluate(
        ({ glbUrl, view }) => window.renderSnapshot(glbUrl, view, '#16171d'),
        { glbUrl: `/models/garments/tee-${item.clan}.glb`, view }
      );
      const snapBuffer = Buffer.from(snapDataUrl.split(',')[1], 'base64');
      await writeFile(`public/images/products/camiseta-clan-${item.clan}-${view}.webp`, snapBuffer);
      console.log(`✓ Rendered public/images/products/camiseta-clan-${item.clan}-${view}.webp (${Math.round(snapBuffer.length / 1024)} KB)`);
    }
  }

  console.log('All 7 Clan T-Shirts built and rendered successfully!');
} finally {
  await browser?.close();
  await server.close();
}

