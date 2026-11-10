import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('riwi.reborn.intro.v1', 'seen');
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as Window & { copiedSource?: string }).copiedSource = text;
        },
      },
    });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});

test('la mascota monumental se descubre con scroll, se pausa y vuelve completa en el catálogo', async ({
  page,
}) => {
  await page.goto('/');
  const mascot = page.getByRole('img', { name: /Mascota RIWI:/ });
  await expect(mascot).toHaveAttribute('data-mascot-mode', 'scroll-reveal');
  const viewport = page.viewportSize()!;
  await expect
    .poll(async () => (await mascot.boundingBox())!.height)
    .toBeGreaterThan(viewport.height * 1.8);
  const initial = (await mascot.boundingBox())!;
  expect(initial.x + initial.width / 2).toBeCloseTo(viewport.width / 2, 0);
  await expect(mascot).toHaveCSS('filter', 'none');
  await page.evaluate(() => scrollTo({ top: 1400, behavior: 'instant' }));
  await expect.poll(async () => (await mascot.boundingBox())!.y).toBeLessThan(initial.y - 100);
  const middle = (await mascot.boundingBox())!;
  expect(middle.x + middle.width / 2).toBeCloseTo(viewport.width / 2, 0);
  await page.getByRole('button', { name: 'Pausar animaciones' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const paused = await mascot.boundingBox();
  await page.evaluate(() => scrollBy({ top: 600, behavior: 'instant' }));
  await page.waitForTimeout(300);
  expect(await mascot.boundingBox()).toEqual(paused);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/#/catalogo');
  await expect(mascot).toHaveAttribute('data-mascot-mode', 'complete');
  await expect.poll(async () => (await mascot.boundingBox())!.height).toBeLessThan(viewport.height);
  const complete = (await mascot.boundingBox())!;
  expect(complete.x + complete.width / 2).toBeCloseTo(viewport.width / 2, 0);
});

test('la carga real precede al holograma progresivo y conserva el código y los controles', async ({
  page,
}, testInfo) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let requested = false;
  await page.route('**/models/optimized/hoodie.glb', async (route) => {
    requested = true;
    const response = await route.fetch();
    await gate;
    await route.fulfill({ response });
  });
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Seleccionar talla L', exact: true }).click();
    await page.getByRole('button', { name: 'Seleccionar color Violeta', exact: true }).click();
    const source = page.getByLabel('Código de tu selección');
    await expect(source).toContainText('"L"');
    await expect(source).toContainText('"Violeta"');
    await page.getByRole('button', { name: 'Copiar código', exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => (window as Window & { copiedSource?: string }).copiedSource))
      .toContain('Violeta');
    await page.getByRole('button', { name: 'Materializar prenda 3D', exact: true }).click();
    const stage = page.locator('.code-fashion-stage');
    await expect.poll(() => requested).toBe(true);
    await expect(stage).toHaveAttribute('data-materialization-state', 'loading');
    await expect(source).toBeVisible();
    await page.waitForTimeout(1050);
    await expect(stage).toHaveAttribute('data-materialization-state', 'loading');
    await expect
      .poll(async () => Number(await stage.getAttribute('data-hologram-progress')))
      .toBe(0);
    if (testInfo.project.name === 'mobile') {
      await expect(page.locator('.fashion-projection')).toBeInViewport();
    }
    release();
    await expect(stage).toHaveAttribute('data-materialization-state', 'revealing');
    await expect
      .poll(async () => Number(await stage.getAttribute('data-hologram-progress')))
      .toBeGreaterThan(0.05);
    expect(Number(await stage.getAttribute('data-hologram-progress'))).toBeLessThan(1);
    const viewer = page.getByTestId('product-viewer');
    const canvas = viewer.locator('canvas');
    await page.getByRole('button', { name: 'Pausar animaciones' }).click();
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    const paused = await stage.getAttribute('data-hologram-progress');
    await expect
      .poll(async () => Number(await canvas.getAttribute('data-hologram-progress')))
      .toBeCloseTo(Number(paused), 3);
    await page.waitForTimeout(300);
    expect(await stage.getAttribute('data-hologram-progress')).toBe(paused);
    await page.getByRole('button', { name: 'Activar animaciones' }).click();
    await expect(stage).toHaveAttribute('data-materialization-state', 'ready');
    await expect
      .poll(async () => Number(await stage.getAttribute('data-hologram-progress')))
      .toBe(1);
    await expect(viewer).toHaveAttribute('data-model-status', 'ready');
    await expect
      .poll(async () => Number(await canvas.getAttribute('data-hologram-progress')))
      .toBe(1);
    await viewer.locator('.viewer-tools').scrollIntoViewIfNeeded();
    const distance = Number(await canvas.getAttribute('data-camera-distance'));
    await viewer.getByRole('button', { name: 'Acercar', exact: true }).click();
    await expect
      .poll(async () => Number(await canvas.getAttribute('data-camera-distance')))
      .toBeLessThan(distance);
    await page
      .locator('.fashion-mode-bar')
      .getByRole('button', { name: 'Código', exact: true })
      .click();
    await expect(stage).toHaveAttribute('data-code-mode', 'source');
    await expect(source).toBeVisible();
    await expect(page.locator('.fashion-live canvas')).toHaveCount(0);
  } finally {
    release();
  }
});

test('cambiar de prenda durante la descarga descarta el resultado anterior', async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let delivered!: () => void;
  const responseDelivered = new Promise<void>((resolve) => {
    delivered = resolve;
  });
  await page.route('**/models/optimized/hoodie.glb', async (route) => {
    const response = await route.fetch();
    await gate;
    await route.fulfill({ response });
    delivered();
  });
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Materializar prenda 3D', exact: true }).click();
    await expect(page.locator('.code-fashion-stage')).toHaveAttribute(
      'data-materialization-state',
      'loading',
    );
    await page.getByRole('combobox', { name: 'Prenda destacada' }).selectOption('camiseta-source');
    await expect(page.getByLabel('Código de tu selección')).toContainText('Camiseta Source');
    await expect(page.locator('.code-fashion-stage')).toHaveAttribute('data-code-mode', 'source');
    release();
    await responseDelivered;
    // Observe after Fiber's delayed renderer disposal to catch stale load/context callbacks.
    await page.waitForTimeout(700);
    await expect(page.locator('.code-fashion-stage')).toHaveAttribute(
      'data-materialization-state',
      'idle',
    );
    await expect(page.locator('.fashion-live canvas')).toHaveCount(0);
  } finally {
    release();
  }
});

test('un modelo fallido conserva el código y permite pasar a fotografía', async ({ page }) => {
  await page.route('**/models/optimized/hoodie.glb', (route) => route.abort());
  await page.goto('/');
  await page.getByRole('button', { name: 'Materializar prenda 3D', exact: true }).click();
  const stage = page.locator('.code-fashion-stage');
  await expect(stage).toHaveAttribute('data-materialization-state', 'error');
  await expect(page.getByTestId('product-viewer')).toHaveAttribute('data-model-status', 'fallback');
  await expect(page.getByLabel('Código de tu selección')).toContainText('Hoodie Compile');
  await page
    .locator('.fashion-mode-bar')
    .getByRole('button', { name: 'Foto', exact: true })
    .click();
  await expect(stage).toHaveAttribute('data-code-mode', 'photo');
  await expect(
    page.getByRole('img', { name: 'Hoodie Compile, vista frontal', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.fashion-live canvas')).toHaveCount(0);
});

test('sin WebGL la proyección ofrece una alternativa sin bloquear la selección', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      contextId: string,
      ...args: unknown[]
    ) {
      if (contextId.includes('webgl')) return null;
      return Reflect.apply(original, this, [contextId, ...args]);
    } as typeof original;
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Materializar prenda 3D', exact: true }).click();
  await expect(page.getByTestId('product-viewer')).toHaveAttribute('data-model-status', 'fallback');
  await expect(page.locator('.code-fashion-stage')).toHaveAttribute(
    'data-materialization-state',
    'error',
  );
  await expect(page.getByLabel('Código de tu selección')).toBeVisible();
  await page
    .locator('.fashion-mode-bar')
    .getByRole('button', { name: 'Foto', exact: true })
    .click();
  await expect(
    page.getByRole('img', { name: 'Hoodie Compile, vista frontal', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Seleccionar talla L', exact: true }).click();
  await expect(page.getByLabel('Código de tu selección')).toContainText('"L"');
});
