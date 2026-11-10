import { chromium } from '@playwright/test';
import { existsSync, writeFileSync } from 'node:fs';
const base = process.argv[2] || 'http://127.0.0.1:5173';
const browser = await chromium.launch({
  headless: true,
  executablePath: ['C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/chromium'].find(existsSync),
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
});
const report = [];
try {
  for (const [name, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.addInitScript(() => sessionStorage.setItem('riwi.reborn.intro.v1', 'seen'));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    await page.getByRole('combobox', { name: 'Prenda destacada' }).selectOption('camisa-runtime');
    await page.getByRole('button', { name: 'Seleccionar talla L', exact: true }).click();
    await page.evaluate(() => {
      const node = document.querySelector('.fashion-workbench');
      scrollTo({ top: scrollY + node.getBoundingClientRect().top - 110, behavior: 'instant' });
    });
    await page.waitForTimeout(900);
    await page.screenshot({ path: `artifacts/materialization-editor-${name}.png` });
    await page.getByRole('button', { name: 'Materializar prenda 3D' }).click();
    await page.waitForFunction(() => {
      const node = document.querySelector('.code-fashion-stage');
      const progress = Number(node.dataset.hologramProgress);
      return node.dataset.materializationState === 'revealing' && progress > .35 && progress < .8;
    });
    await page.getByRole('button', { name: 'Pausar animaciones', exact: true }).click();
    const intermediate = await page.locator('.code-fashion-stage').getAttribute('data-hologram-progress');
    await page.waitForTimeout(100);
    await page.screenshot({ path: `artifacts/materialization-hologram-${name}.png` });
    await page.getByRole('button', { name: 'Activar animaciones', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('.code-fashion-stage')?.dataset.materializationState === 'ready');
    await page.waitForTimeout(100);
    await page.screenshot({ path: `artifacts/materialization-complete-${name}.png` });
    const canvas = page.locator('.fashion-live canvas');
    const before = Number(await canvas.getAttribute('data-camera-distance'));
    await page.getByRole('button', { name: 'Acercar', exact: true }).click();
    await page.waitForFunction(distance => Number(document.querySelector('.fashion-live canvas').dataset.cameraDistance) < distance, before);
    report.push({ name, base, errors, intermediate: Number(intermediate), complete: Number(await page.locator('.code-fashion-stage').getAttribute('data-hologram-progress')), cameraDistance: { before, after: Number(await canvas.getAttribute('data-camera-distance')) }, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), codeVisible: await page.getByLabel('Código de tu selección').isVisible() });
    await page.close();
  }
  writeFileSync('artifacts/materialization-visual-check.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
