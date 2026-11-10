import { test, expect } from '@playwright/test';

test('intro normaliza diez segundos, transfiere el último fotograma y libera el video', async ({
  page,
}) => {
  await page.goto('/');
  const experience = page.locator('[data-cinema-state]');
  await expect(experience).toHaveAttribute('data-cinema-state', 'INTRO_PLAYING');
  const video = page.locator('.reborn-intro-video');
  await expect
    .poll(() => video.evaluate((media: HTMLVideoElement) => media.currentTime))
    .toBeGreaterThan(0.05);
  const props = await video.evaluate((media: HTMLVideoElement) => ({
    muted: media.muted,
    inline: media.playsInline,
    loop: media.loop,
    controls: media.controls,
    presentation: media.duration / media.playbackRate,
  }));
  expect(props).toMatchObject({ muted: true, inline: true, loop: false, controls: false });
  expect(props.presentation).toBeCloseTo(10, 3);
  await video.evaluate((media: HTMLVideoElement) => {
    media.currentTime = media.duration - 0.15;
  });
  await expect(experience).toHaveAttribute('data-cinema-state', 'INTRO_TRANSITION');
  await expect(experience).toHaveAttribute('data-cinema-state', 'EXPERIENCE_READY');
  await expect(video).toHaveCount(0);
  await expect(page.locator('.world-clean')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('img', { name: /Mascota RIWI:/ })).toBeVisible();
  await expect(page.locator('.reborn-header')).toBeVisible();
});

test('saltar, navegar y recargar conserva la sesión; replay es explícito', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Saltar introducción' }).click();
  await expect(page.locator('[data-cinema-state]')).toHaveAttribute(
    'data-cinema-state',
    'EXPERIENCE_READY',
  );
  await page
    .locator('#deploy-identity')
    .getByRole('link', { name: 'EXPLORE THE COLLECTION' })
    .click();
  await expect(page).toHaveURL(/catalogo/);
  await page.locator('.reborn-header .reborn-brand').click();
  await page.reload();
  await expect(page.locator('.reborn-intro-video')).toHaveCount(0);
  await page.getByRole('button', { name: /REPLAY ARRIVAL/ }).click();
  await expect(page.locator('[data-cinema-state]')).toHaveAttribute(
    'data-cinema-state',
    'INTRO_PLAYING',
  );
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-cinema-state]')).toHaveAttribute(
    'data-cinema-state',
    'EXPERIENCE_READY',
  );
});

test('autoplay rechazado ofrece entrada manual funcional', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () =>
      Promise.reject(new DOMException('Autoplay blocked', 'NotAllowedError'));
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Reproducir introducción' })).toBeVisible();
  await page.getByRole('button', { name: 'Entrar a la experiencia' }).click();
  await expect(page.locator('[data-cinema-state]')).toHaveAttribute(
    'data-cinema-state',
    'EXPERIENCE_FALLBACK',
  );
  await expect(page.locator('.reborn-intro-video')).toHaveCount(0);
});

test('video no disponible mantiene el mundo y permite explorar productos', async ({ page }) => {
  await page.route('**/media/riwi-cyber-intro.mp4', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-cinema-state]')).toHaveAttribute(
    'data-cinema-state',
    'EXPERIENCE_FALLBACK',
  );
  await expect(page.locator('.world-clean')).toHaveCSS('opacity', '1');
  await page.locator('.loadout-01 .loadout-link').click();
  await expect(page.locator('.product-card')).toHaveCount(1);
});

test('movimiento reducido no descarga el video y conserva la composición', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', (request) => {
    if (request.url().includes('riwi-cyber-intro.mp4')) requests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('[data-cinema-state]')).toHaveAttribute(
    'data-cinema-state',
    'EXPERIENCE_READY',
  );
  await expect(page.locator('.reborn-intro-video')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Saltar introducción' })).toHaveCount(0);
  expect(requests).toEqual([]);
});

test('un recurso crítico fallido permite entrar sin bloquear la navegación', async ({ page }) => {
  await page.route('**/media/riwi-world-clean.webp', (route) => route.abort());
  await page.goto('/');
  await expect(page.locator('[data-cinema-state]')).toHaveAttribute(
    'data-cinema-state',
    'EXPERIENCE_FALLBACK',
  );
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.getByRole('button', { name: 'EXPLORE DROP 001' }).click();
  await expect(page.locator('#select-loadout h2')).toBeInViewport();
});
