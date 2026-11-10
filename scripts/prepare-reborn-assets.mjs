import { chromium } from '@playwright/test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const browser = await chromium.launch({
  headless: true,
  executablePath: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/chromium',
  ].find(existsSync),
});
try {
  const page = await browser.newPage();
  const metadata = {};
  for (const [id, source, target] of [
    ['mascot', 'public/media/riwi-mascot-alpha.png', 'public/media/riwi-mascot-alpha.webp'],
    [
      'world',
      'imported_assets/reborn-authoring/riwi-world-clean.png',
      'public/media/riwi-world-clean.webp',
    ],
  ]) {
    const data = readFileSync(source).toString('base64');
    const result = await page.evaluate(async (data) => {
      const image = new Image();
      image.src = `data:image/png;base64,${data}`;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let minX = canvas.width,
        minY = canvas.height,
        maxX = 0,
        maxY = 0,
        transparent = 0;
      for (let y = 0; y < canvas.height; y++)
        for (let x = 0; x < canvas.width; x++) {
          const alpha = pixels[(y * canvas.width + x) * 4 + 3];
          if (alpha < 16) transparent++;
          if (alpha > 32) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }
      return {
        width: canvas.width,
        height: canvas.height,
        bounds: { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 },
        transparentPixels: transparent,
        data: canvas.toDataURL('image/webp', 0.94).split(',')[1],
      };
    }, data);
    writeFileSync(target, Buffer.from(result.data, 'base64'));
    delete result.data;
    metadata[id] = result;
  }
  writeFileSync('artifacts/reborn-asset-metadata.json', JSON.stringify(metadata, null, 2));
  console.log(JSON.stringify(metadata));
} finally {
  await browser.close();
}
