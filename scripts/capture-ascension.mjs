import { chromium } from '@playwright/test';
import { existsSync, writeFileSync } from 'node:fs';
const base = process.argv[2] || 'http://127.0.0.1:4173';
const browser = await chromium.launch({
  headless: true,
  executablePath: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/chromium',
  ].find(existsSync),
  args: [
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
  ],
});
const report = [];
try {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['mobile', 390, 844],
  ]) {
    const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      [...document.querySelectorAll('.world-clean,.mascot-sprite img')].every(
        (img) => img.complete && img.naturalWidth,
      ),
    );
    const mascot = page.getByRole('img', { name: /Mascota RIWI:/ });
    const initial = await mascot.boundingBox();
    await page.screenshot({ path: `artifacts/ascension-hero-${name}.png` });
    await page.getByRole('button', { name: 'Materializar prenda 3D' }).click();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="product-viewer"]')?.dataset.modelStatus === 'ready',
    );
    await page.evaluate(() => {
      const node = document.querySelector('.featured-product-stage');
      scrollTo({ top: scrollY + node.getBoundingClientRect().top - 100, behavior: 'instant' });
    });
    await page.waitForFunction(() => {
      const tools = document.querySelector('.fashion-live .viewer-tools').getBoundingClientRect();
      return tools.top >= 75 && tools.bottom <= innerHeight;
    });
    await page.screenshot({ path: `artifacts/ascension-materialized-${name}.png` });
    const canvas = page.getByTestId('product-viewer').locator('canvas');
    const before = Number(await canvas.getAttribute('data-camera-distance'));
    await page
      .getByTestId('product-viewer')
      .getByRole('button', { name: 'Acercar', exact: true })
      .click();
    await page.waitForFunction(
      (distance) =>
        Number(document.querySelector('.fashion-live canvas').dataset.cameraDistance) < distance,
      before,
    );
    const after = Number(await canvas.getAttribute('data-camera-distance'));
    const sharp = await page
      .getByTestId('product-viewer')
      .evaluate((node) => getComputedStyle(node).backdropFilter === 'none');
    await page
      .locator('.fashion-mode-bar')
      .getByRole('button', { name: 'Código', exact: true })
      .click();
    report.push({
      name,
      width,
      height,
      errors,
      controlsAccessible: true,
      sharpMascotBehindViewer: sharp,
      cameraDistance: { before, after },
      mascotFixed: JSON.stringify(initial) === JSON.stringify(await mascot.boundingBox()),
      canvasAfterSource: await page.locator('canvas').count(),
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    });
    await page.close();
  }
  writeFileSync('artifacts/ascension-production-check.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
