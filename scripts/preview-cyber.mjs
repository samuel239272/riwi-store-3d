import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
const baseURL = process.argv[2] || 'http://127.0.0.1:5173';

const browser = await chromium.launch({
  headless: true,
  executablePath:
    process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
    [
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
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(baseURL);
  await page.waitForFunction(() => document.querySelector('video')?.currentTime > 0.4);
  await page.screenshot({ path: 'artifacts/cyber-intro-desktop.png' });
  await page.waitForFunction(
    () => document.querySelector('[data-cinema-phase]')?.dataset.cinemaPhase === 'ready',
    { timeout: 22000 },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'artifacts/cyber-home-desktop.png' });
  console.log(
    JSON.stringify({
      intro: await page
        .locator('video')
        .evaluate((video) => ({
          time: video.currentTime,
          ended: video.ended,
          paused: video.paused,
          duration: video.duration,
        })),
    }),
  );
  await page.locator('.cyber-showroom').scrollIntoViewIfNeeded();
  await page.getByTestId('product-viewer').waitFor();
  await page.waitForFunction(
    () => document.querySelector('[data-testid="product-viewer"]')?.dataset.modelStatus === 'ready',
  );
  await page
    .locator('.cyber-showroom')
    .screenshot({ path: 'artifacts/cyber-showroom-desktop.png' });
  await page.locator('.cyber-identity').scrollIntoViewIfNeeded();
  await page.waitForFunction(() =>
    document.querySelector('.cyber-compile-status')?.textContent.includes('compilada'),
  );
  await page
    .locator('.cyber-identity')
    .screenshot({ path: 'artifacts/cyber-identity-desktop.png' });
  for (const selector of [
    '.cyber-collections',
    '.cyber-products',
    '.cyber-culture',
    '.cyber-footer',
  ])
    await page.locator(selector).scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'artifacts/cyber-home-desktop-full.png', fullPage: true });
  console.log(
    JSON.stringify({
      desktopErrors: errors,
      overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    }),
  );
  await page.close();
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
    isMobile: true,
    hasTouch: true,
  });
  await mobile.goto(baseURL);
  await mobile.evaluate(() => document.fonts.ready);
  await mobile.screenshot({ path: 'artifacts/cyber-home-mobile.png' });
  for (const selector of [
    '.cyber-collections',
    '.cyber-showroom',
    '.cyber-products',
    '.cyber-culture',
    '.cyber-identity',
    '.cyber-footer',
  ])
    await mobile.locator(selector).scrollIntoViewIfNeeded();
  await mobile.evaluate(() => window.scrollTo(0, 0));
  await mobile.screenshot({ path: 'artifacts/cyber-home-mobile-full.png', fullPage: true });
  console.log(
    JSON.stringify({
      mobileOverflow: await mobile.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      mobileVideoSource: await mobile.locator('video').getAttribute('src'),
    }),
  );
  await mobile.close();
} finally {
  await browser.close();
}
