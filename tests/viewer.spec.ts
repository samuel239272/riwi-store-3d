import { test, expect } from '@playwright/test';

test('prenda 3D: zoom real, presets, arrastre y controles de teclado', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/producto/hoodie-compile');
  const viewer = page.getByTestId('product-viewer');
  await expect(viewer).toHaveAttribute('data-model-status', 'ready');
  const canvas = viewer.locator('canvas');
  await expect(canvas).toHaveAttribute('data-camera-position', /.+/);
  const initial = await canvas.getAttribute('data-camera-position');
  const distance = Number(await canvas.getAttribute('data-camera-distance'));
  await viewer.getByRole('button', { name: 'Acercar', exact: true }).click();
  await expect.poll(async () => Number(await canvas.getAttribute('data-camera-distance'))).toBeLessThan(distance - 0.2);
  await viewer.getByRole('button', { name: 'Alejar', exact: true }).click();
  await expect.poll(async () => Number(await canvas.getAttribute('data-camera-distance'))).toBeGreaterThan(distance - 0.1);
  await viewer.getByRole('button', { name: 'Posterior', exact: true }).click();
  await expect.poll(async () => Number((await canvas.getAttribute('data-camera-position'))?.split(',')[2])).toBeLessThan(-4);
  await viewer.getByRole('button', { name: 'Frontal', exact: true }).click();
  await expect.poll(async () => Number((await canvas.getAttribute('data-camera-position'))?.split(',')[0])).toBeCloseTo(0, 1);
  await viewer.getByRole('button', { name: 'Restablecer cámara' }).click();
  await expect(canvas).toHaveAttribute('data-camera-position', initial!);
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error('Missing canvas bounds');
  const center = { x: box.x + box.width * 0.5, y: box.y + box.height * 0.5 };
  if (testInfo.project.name === 'desktop') {
    await page.mouse.move(center.x, center.y);
    await page.mouse.down();
    await page.mouse.move(center.x + 70, center.y + 20, { steps: 8 });
    await page.mouse.up();
  } else {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [center] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: center.x + 60, y: center.y + 10 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  await expect(canvas).not.toHaveAttribute('data-camera-position', initial!);
  const region = viewer.getByRole('region', { name: /Visor interactivo/ });
  await region.focus();
  await page.keyboard.press('0');
  await expect(canvas).toHaveAttribute('data-camera-position', initial!);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => Number((await canvas.getAttribute('data-camera-position'))?.split(',')[0])).toBeLessThan(-4);
});

test('los siete tipos de geometría cargan sin errores de ejecución', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const id of ['hoodie-compile', 'camiseta-source', 'camisa-runtime', 'jeans-branch', 'buzo-loop', 'sudadera-flow', 'gorra-commit', 'gorra-origin', 'chaqueta-deploy', 'camiseta-clan-ubuntu']) {
    await page.goto(`/#/producto/${id}`);
    await expect(page.getByTestId('product-viewer')).toHaveAttribute('data-model-status', 'ready');
    await expect(page.getByTestId('product-viewer').locator('canvas')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('descarga fallida: respaldo y reintento estable después de liberar el canvas anterior', async ({ page }) => {
  await page.route('**/models/optimized/hoodie.glb', route => route.abort());
  await page.goto('/#/producto/hoodie-compile');
  const viewer = page.getByTestId('product-viewer');
  await expect(viewer).toHaveAttribute('data-model-status', 'fallback');
  await expect(viewer.locator('img')).toBeVisible();
  await page.unroute('**/models/optimized/hoodie.glb');
  await viewer.getByRole('button', { name: 'Reintentar carga' }).click();
  await expect(viewer).toHaveAttribute('data-model-status', 'ready');
  // R3F disposes the old renderer after 500 ms. Observe beyond this interval to
  // catch stale context-lost callbacks that used to overwrite the new state.
  await page.waitForTimeout(900);
  await expect(viewer).toHaveAttribute('data-model-status', 'ready');
});

test('sin WebGL: imagen alternativa y opciones de compra accesibles', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, contextId: string, ...args: unknown[]) {
      if (contextId.includes('webgl')) return null;
      return Reflect.apply(original, this, [contextId, ...args]);
    } as typeof original;
  });
  await page.goto('/#/producto/hoodie-compile');
  const viewer = page.getByTestId('product-viewer');
  await expect(viewer).toHaveAttribute('data-model-status', 'fallback');
  await expect(viewer.locator('img')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hoodie Compile', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Agregar al carrito/ })).toBeVisible();
});
