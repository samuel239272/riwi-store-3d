import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { launchOptions } from './qa-browser.mjs';

const baseURL = process.argv[2] ?? 'http://127.0.0.1:5173';
const browser = await chromium.launch(launchOptions);
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const failures = [];
  page.on('pageerror', error => failures.push(error.message));
  await page.goto(baseURL);
  await page.getByRole('heading', { name: /Tu código/ }).waitFor();
  await page.goto(`${baseURL}/#/catalogo`);
  await page.locator('.product-card').first().waitFor();
  assert.equal(await page.locator('.product-card').count(), 9);
  await page.getByRole('textbox', { name: 'Buscar por nombre o referencia' }).fill('hoodie');
  await page.locator('.product-card').first().waitFor();
  await page.waitForFunction(() => document.querySelectorAll('.product-card').length === 1);
  assert.equal(await page.locator('.product-card').count(), 1);
  await page.locator('.product-card').first().click();
  await page.getByRole('heading', { name: 'Hoodie Compile' }).waitFor();
  await page.getByTestId('product-viewer').waitFor({ state: 'visible' });
  await page.getByTestId('product-viewer').waitFor({ state: 'attached' });
  await page.waitForFunction(() => document.querySelector('[data-testid="product-viewer"]')?.getAttribute('data-model-status') === 'ready');
  await page.getByRole('button', { name: 'Agregar al carrito' }).click();
  await page.getByRole('link', { name: /Carrito, 1 artículos/ }).click();
  await page.getByRole('heading', { name: /Tu selección/ }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Aumentar cantidad' }).count(), 1);
  assert.deepEqual(failures, []);
  console.log('RIWI local check: home, catalog, search, 3D product and persisted cart flow passed.');
} finally { await browser.close(); }
