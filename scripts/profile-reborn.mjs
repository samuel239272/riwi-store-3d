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
const report = {
  base,
  conditions:
    'Local Windows Chromium, production preview, no network/CPU throttling, software WebGL. Lab observation only; physical devices and field INP not measured.',
  visits: [],
};
try {
  for (const intro of [false, true]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [],
      requests = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => requests.push(request.url()));
    await page.addInitScript(
      ({ intro }) => {
        if (!intro) sessionStorage.setItem('riwi.reborn.intro.v1', 'seen');
        window.__rebornMetrics = { lcp: 0, cls: 0, longTasks: [] };
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) window.__rebornMetrics.lcp = entry.startTime;
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries())
            if (!entry.hadRecentInput) window.__rebornMetrics.cls += entry.value;
        }).observe({ type: 'layout-shift', buffered: true });
        new PerformanceObserver((list) => {
          window.__rebornMetrics.longTasks.push(
            ...list.getEntries().map((entry) => entry.duration),
          );
        }).observe({ type: 'longtask', buffered: true });
      },
      { intro },
    );
    await page.goto(base);
    await page.waitForFunction(
      () =>
        document.querySelector('[data-cinema-state]')?.dataset.cinemaState === 'EXPERIENCE_READY',
      {},
      { timeout: 25000 },
    );
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `artifacts/ascension-hero-${intro ? 'arrival' : 'desktop'}.png` });
    await page.waitForFunction(() => window.__rebornMetrics.lcp > 0, null, { timeout: 5000 }).catch(() => {});
    const metrics = await page.evaluate(() => ({
      ...window.__rebornMetrics,
      lcp: window.__rebornMetrics.lcp || null,
      resources: performance
        .getEntriesByType('resource')
        .map((entry) => ({
          name: entry.name.split('/').pop(),
          transfer: entry.transferSize,
          encoded: entry.encodedBodySize,
          duration: entry.duration,
        })),
    }));
    const homeCanvasCount = await page.locator('canvas').count();
    const initialThreeRequests = requests.filter((url) =>
      /\/assets\/(three|ProductViewer|ProductScene)/.test(url),
    );
    if (!intro) {
      await page.locator('#code-collection').scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'artifacts/ascension-code-desktop.png' });
      await page.getByRole('button', { name: 'Materializar prenda 3D' }).click();
      await page.getByTestId('product-viewer').waitFor();
      await page.waitForFunction(
        () =>
          document.querySelector('[data-testid="product-viewer"]')?.dataset.modelStatus === 'ready',
      );
      await page.screenshot({ path: 'artifacts/ascension-materialized-desktop.png' });
    }
    report.visits.push({
      intro,
      metrics,
      homeCanvasCount,
      initialThreeRequests,
      errors,
      videoCountAfter: await page.locator('video').count(),
    });
    await page.close();
  }
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    reducedMotion: 'reduce',
  });
  await mobile.goto(base);
  await mobile.evaluate(() => document.fonts.ready);
  await mobile.getByRole('button', { name: 'Materializar prenda 3D' }).click();
  await mobile.waitForFunction(
    () => document.querySelector('[data-testid="product-viewer"]')?.dataset.modelStatus === 'ready',
  );
  await mobile.evaluate(() => {
    const node = document.querySelector('.featured-product-stage');
    scrollTo({ top: scrollY + node.getBoundingClientRect().top - 100, behavior: 'instant' });
  });
  await mobile.screenshot({ path: 'artifacts/ascension-materialized-mobile.png' });
  await mobile.close();
  writeFileSync('artifacts/reborn-performance.json', JSON.stringify(report, null, 2));
  console.log(
    JSON.stringify(
      report.visits.map(
        ({ intro, metrics, homeCanvasCount, initialThreeRequests, errors, videoCountAfter }) => ({
          intro,
          lcpMs: metrics.lcp,
          cls: metrics.cls,
          longTasks: metrics.longTasks,
          homeCanvasCount,
          initialThreeRequests,
          errors,
          videoCountAfter,
        }),
      ),
    ),
  );
} finally {
  await browser.close();
}
