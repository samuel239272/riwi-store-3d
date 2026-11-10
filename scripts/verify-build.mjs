import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import assert from 'node:assert/strict';
import { launchOptions } from './qa-browser.mjs';

const origin = 'http://127.0.0.1:4173';
const base = process.env.TEST_BASE_PATH || '/';
const server = spawn(process.execPath, ['node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], { stdio: 'inherit' });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { ready = (await fetch(`${origin}${base}`)).ok; } catch { /* Server starting. */ }
    if (server.exitCode !== null) throw new Error('Preview server exited before readiness');
    if (ready) break;
    await delay(250);
  }
  assert(ready, 'Production preview did not become ready');
  browser = await chromium.launch(launchOptions);
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  const requests = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => requests.push(request.url()));
  await page.goto(`${origin}${base}#/catalogo`);
  await page.locator('.product-card').first().waitFor();
  assert.equal(await page.locator('.product-card').count(), 8);
  assert(!requests.some(url => /assets\/three[-.]/.test(url)), 'Catalog eagerly loads the 3D engine');
  await page.goto(`${origin}${base}#/producto/hoodie-compile`);
  await page.locator('[data-model-status="ready"]').waitFor();
  assert(requests.some(url => url.endsWith('/models/garments/hoodie.glb')));
  assert(requests.some(url => /assets\/three-/.test(url)), 'Viewer engine was not loaded');
  assert.deepEqual(errors, []);
  console.log('PASS: production catalog (8 products), deferred engine, garment GLB and navigation without runtime errors');
} finally {
  await browser?.close();
  server.kill();
}
