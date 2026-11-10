import { chromium } from '@playwright/test';
import { existsSync, writeFileSync } from 'node:fs';
const base = process.argv[2] || 'http://127.0.0.1:5173';
const browser = await chromium.launch({
  executablePath: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/chromium',
  ].find(existsSync),
  headless: true,
});
const report = { base, responsive: [], movement: {}, cinema: {} };
const frames = (page) =>
  page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
try {
  for (const [width, height] of [
    [320, 812],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1440, 1000],
    [1920, 1080],
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
    const start = await mascot.boundingBox();
    const panels = [];
    for (const name of ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'SQL']) {
      const trigger = page.getByRole('button', {
        name: `Explorar tecnología ${name}`,
        exact: true,
      });
      await trigger.focus();
      await trigger.press('Enter');
      const box = await page.locator('.tech-inspector').boundingBox();
      panels.push({
        name,
        box,
        within:
          box.x >= 0 &&
          box.y >= 0 &&
          box.x + box.width <= width + 1 &&
          box.y + box.height <= height + 1,
      });
      await page.keyboard.press('Escape');
    }
    const checkpoints = [];
    for (const id of ['select-loadout', 'code-collection', 'built-by-coders', 'deploy-identity']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await frames(page);
      const current = await mascot.boundingBox();
      checkpoints.push({
        id,
        fixed: JSON.stringify(current) === JSON.stringify(start),
        overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      });
    }
    await page.evaluate(() => scrollTo(0, 0));
    await frames(page);
    if ([320, 768, 1024, 1920].includes(width))
      await page.screenshot({ path: `artifacts/reborn-${width}-hero.png` });
    report.responsive.push({ width, height, errors, mascot: start, panels, checkpoints });
    await page.close();
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.addInitScript(() => sessionStorage.setItem('riwi.reborn.intro.v1', 'seen'));
  await page.goto(base);
  await page.mouse.move(0, 0);
  const positions = () =>
    page.locator('.field-orb').evaluateAll((nodes) =>
      nodes.map((node) => {
        const r = node.getBoundingClientRect();
        return { x: r.x, y: r.y, depth: node.dataset.depth };
      }),
    );
  const initial = await positions();
  await page.waitForTimeout(800);
  const ambient = await positions();
  await page.evaluate(() => scrollTo({ top: 1600, behavior: 'instant' }));
  await page.waitForTimeout(700);
  const scrolled = await positions();
  report.movement = {
    initial,
    ambient,
    scrolled,
    homeCanvasCount: await page.locator('canvas').count(),
  };
  await page.close();
  const cinema = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  cinema.on('pageerror', (e) => errors.push(e.message));
  await cinema.goto(base);
  const video = cinema.locator('.reborn-intro-video');
  await cinema.waitForFunction(() => document.querySelector('video')?.currentTime > 0.1);
  const media = await video.evaluate((v) => ({
    duration: v.duration,
    presentation: v.duration / v.playbackRate,
  }));
  await video.evaluate((v) => {
    v.currentTime = v.duration - 0.15;
  });
  await cinema.waitForFunction(
    () => document.querySelector('[data-cinema-state]')?.dataset.cinemaState === 'INTRO_TRANSITION',
  );
  await cinema.screenshot({ path: 'artifacts/reborn-transition-start.png' });
  await cinema.waitForTimeout(500);
  await cinema.screenshot({ path: 'artifacts/reborn-transition-blend.png' });
  await cinema.waitForFunction(
    () => document.querySelector('[data-cinema-state]')?.dataset.cinemaState === 'EXPERIENCE_READY',
  );
  await cinema.screenshot({ path: 'artifacts/reborn-transition-ready.png' });
  report.cinema = {
    media,
    errors,
    videoCountAfter: await video.count(),
    state: await cinema.locator('[data-cinema-state]').getAttribute('data-cinema-state'),
  };
  await cinema.close();
  writeFileSync('artifacts/reborn-final-qa.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
}
