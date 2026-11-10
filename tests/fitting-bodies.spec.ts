import { test, expect } from '@playwright/test';

test('las camisetas de clanes y las dos gorras conservan sus modelos en el probador', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('/#/probador?prenda=camiseta-clan-ubuntu');
  const viewer = page.getByTestId('fitting-viewer');
  for (const [product, model] of [
    ['camiseta-clan-ubuntu', 'tee-ubuntu'],
    ['gorra-commit', 'cap-snapback'],
    ['gorra-origin', 'cap-baseball'],
  ]) {
    await page.getByRole('combobox', { name: /Elige tu prenda/ }).selectOption(product);
    await expect(viewer).toHaveAttribute('data-model-status', 'ready');
    await expect(viewer.locator('canvas')).toHaveAttribute(
      'data-garment-source',
      new RegExp(`/models/optimized/${model}\\.glb$`),
    );
    expect(
      Number(await viewer.locator('canvas').getAttribute('data-garment-vertex-count')),
    ).toBeGreaterThan(1000);
  }
});

test('los FBX importados cambian entre hombre y mujer y las prendas usan el GLB del catálogo', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/#/probador');
  const viewer = page.getByTestId('fitting-viewer'),
    canvas = viewer.locator('canvas');
  await expect(viewer).toHaveAttribute('data-model-status', 'ready');
  await expect(canvas).toHaveAttribute('data-body-source', '/models/bodies/male.glb');
  expect(Number(await canvas.getAttribute('data-body-vertex-count'))).toBeGreaterThan(7000);
  await expect(canvas).toHaveAttribute('data-garment-source', /\/models\/optimized\/hoodie\.glb$/);
  expect(Number(await canvas.getAttribute('data-garment-vertex-count'))).toBeGreaterThan(10000);
  await page.getByRole('button', { name: 'Mujer', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-body-model', 'female');
  expect(Number(await canvas.getAttribute('data-body-vertex-count'))).toBeGreaterThan(180000);
  await expect(page.getByRole('spinbutton', { name: 'Estatura cm', exact: true })).toHaveValue(
    '168',
  );
  await page.getByRole('button', { name: 'Solo cuerpo', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-outfit', 'body');
  await expect(canvas).toHaveAttribute('data-garment-vertex-count', '0');
  await page.getByRole('button', { name: 'Con prenda', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-outfit', 'dressed');
  await expect(canvas).toHaveAttribute('data-garment-source', /hoodie\.glb$/);
  expect(errors).toEqual([]);
});

test('la complexión modifica vértices reales y se guarda el cuerpo femenino con sus medidas', async ({
  page,
}) => {
  await page.goto('/#/probador');
  const viewer = page.getByTestId('fitting-viewer'),
    canvas = viewer.locator('canvas');
  await page.getByRole('button', { name: 'Mujer', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-body-model', 'female');
  await page.getByRole('button', { name: 'Solo cuerpo', exact: true }).click();
  await expect(canvas).toHaveAttribute('data-outfit', 'body');
  await page.getByRole('button', { name: 'Delgada', exact: true }).click();
  const thinWaist = await page
    .getByRole('spinbutton', { name: 'Cintura cm', exact: true })
    .inputValue();
  await expect(canvas).toHaveAttribute('data-body-waist', thinWaist);
  const thinWidth = Number(await canvas.getAttribute('data-body-mesh-width'));
  await page.getByRole('button', { name: 'Corpulenta', exact: true }).click();
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-body-mesh-width')))
    .toBeGreaterThan(thinWidth * 1.15);
  expect(
    Number(await page.getByRole('spinbutton', { name: 'Cintura cm', exact: true }).inputValue()),
  ).toBeGreaterThan(Number(thinWaist));
  await page.getByRole('button', { name: 'Guardar en este equipo' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Mujer', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(canvas).toHaveAttribute('data-body-model', 'female');
  await expect(page.getByRole('spinbutton', { name: 'Cintura cm', exact: true })).toHaveValue(
    '103',
  );
  await page.getByRole('button', { name: 'Restaurar proporciones originales' }).click();
  await expect(canvas).toHaveAttribute('data-body-waist', '72');
  await page.getByRole('button', { name: 'Borrar mis medidas' }).click();
  await expect(page.getByRole('button', { name: 'Hombre', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(await page.evaluate(() => localStorage.getItem('riwi-fitting-avatar-v2'))).toBeNull();
});

test('fallo del modelo humano permite reintentar sin perder el cuerpo seleccionado', async ({
  page,
}) => {
  await page.route('**/models/bodies/female.glb', (route) => route.abort());
  await page.goto('/#/probador');
  await page.getByRole('button', { name: 'Mujer', exact: true }).click();
  const viewer = page.getByTestId('fitting-viewer');
  await expect(viewer).toHaveAttribute('data-model-status', 'fallback');
  await expect(page.getByRole('button', { name: 'Mujer', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.unroute('**/models/bodies/female.glb');
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  await expect(viewer).toHaveAttribute('data-model-status', 'ready');
  await expect(viewer.locator('canvas')).toHaveAttribute('data-body-model', 'female');
});
