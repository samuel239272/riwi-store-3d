import { chromium } from '@playwright/test';
import { existsSync, writeFileSync } from 'node:fs';
const url = process.argv[2] || 'http://127.0.0.1:5173';
const browser = await chromium.launch({ headless: true, executablePath: ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/chromium'].find(existsSync), args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const report = { environment: 'Headless Chromium / software WebGL (SwiftShader); diagnostic, not a physical-device benchmark', widths: [], rendering: {} };
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  await page.addInitScript(() => {
    sessionStorage.setItem('riwi.cyber.intro.v1', 'seen');
    window.__cyberGpu = { calls: 0, frames: new Set(), frame: 0 };
    const tick = () => { window.__cyberGpu.frame++; requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    for (const context of [window.WebGLRenderingContext, window.WebGL2RenderingContext].filter(Boolean)) {
      for (const method of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced']) {
        const original = context.prototype[method];
        if (!original) continue;
        context.prototype[method] = function (...args) { window.__cyberGpu.calls++; window.__cyberGpu.frames.add(window.__cyberGpu.frame); return Reflect.apply(original, this, args); };
      }
    }
  });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 960 });
    await page.waitForTimeout(80);
    report.widths.push(await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth })));
  }
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.locator('.cyber-showroom').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-testid="product-viewer"]')?.dataset.modelStatus === 'ready');
  await page.waitForTimeout(1500);
  const reset = () => page.evaluate(() => { window.__cyberGpu.calls = 0; window.__cyberGpu.frames.clear(); return performance.now(); });
  await reset(); await page.waitForTimeout(500);
  report.rendering.idle500ms = await page.evaluate(() => ({ drawCalls: window.__cyberGpu.calls, renderedFrames: window.__cyberGpu.frames.size }));
  const rotate = page.getByTestId('product-viewer').getByRole('button', { name: 'Rotación automática' });
  await rotate.click(); await page.waitForTimeout(250);
  const rotatingStart = await reset(); await page.waitForTimeout(1500);
  report.rendering.continuousRotation = await page.evaluate(start => ({ drawCalls: window.__cyberGpu.calls, renderedFrames: window.__cyberGpu.frames.size, sampleMilliseconds: Math.round(performance.now() - start), renderedFps: Number((window.__cyberGpu.frames.size / ((performance.now() - start) / 1000)).toFixed(1)) }), rotatingStart);
  await rotate.click(); await page.waitForTimeout(500);
  const canvas = page.getByTestId('product-viewer').locator('canvas'); const box = await canvas.boundingBox();
  const start = await reset();
  await page.mouse.move(box.x + box.width * .45, box.y + box.height * .5); await page.mouse.down();
  for (let i = 0; i < 30; i++) { await page.mouse.move(box.x + box.width * .45 + i * 3, box.y + box.height * .5 + i / 3); await page.waitForTimeout(20); }
  await page.mouse.up();
  report.rendering.syntheticDrag = await page.evaluate(start => ({ drawCalls: window.__cyberGpu.calls, renderedFrames: window.__cyberGpu.frames.size, sampleMilliseconds: Math.round(performance.now() - start) }), start);
  report.rendering.canvasDpr = await canvas.evaluate(canvas => Number((canvas.width / canvas.getBoundingClientRect().width).toFixed(2)));
  writeFileSync('artifacts/cyber-performance.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
