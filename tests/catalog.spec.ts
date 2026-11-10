import { test, expect } from '@playwright/test';

test('catálogo RIWI: búsqueda, categoría, filtros combinados y orden', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/#/catalogo');
  await expect(page.locator('.product-card')).toHaveCount(17);
  const search = page.getByRole('textbox', { name: 'Buscar por nombre o referencia' });
  await search.fill('hoodie');
  await expect(page.locator('.product-card h3')).toHaveText('Hoodie Compile');
  await search.fill('RW-JN-004');
  await expect(page.locator('.product-card h3')).toHaveText('Jeans Branch');
  await search.fill('sin-resultados');
  await expect(page.getByRole('heading', { name: 'No encontramos ese producto.' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver todos los productos' }).click();
  await page.getByRole('button', { name: 'Clanes7', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(7);
  await page.getByRole('button', { name: 'Camisetas2', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(2);
  await page.getByRole('combobox', { name: 'Filtrar por color' }).selectOption('Crudo');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card h3')).toHaveText('Camiseta Source');
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  await page.getByRole('combobox', { name: 'Ordenar productos' }).selectOption('price-asc');
  await expect(page.locator('.product-card h3').first()).toHaveText('Gorra Commit');
  expect(errors).toEqual([]);
});

test('variantes, carrito persistente y eliminación', async ({ page }) => {
  await page.goto('/#/producto/hoodie-compile');
  await page.getByRole('button', { name: 'Talla L', exact: true }).click();
  await page.getByRole('button', { name: 'Color Violeta', exact: true }).click();
  await page.getByRole('button', { name: 'Aumentar cantidad', exact: true }).click();
  await page.getByRole('button', { name: 'Agregar al carrito' }).click();
  await page.getByRole('link', { name: 'Ver carrito', exact: true }).click();
  await expect(page.locator('.cart-line')).toHaveCount(1);
  await expect(page.getByRole('combobox', { name: 'Talla de Hoodie Compile' })).toHaveValue('L');
  await expect(page.getByRole('combobox', { name: 'Color de Hoodie Compile' })).toHaveValue('Violeta');
  await page.reload();
  await expect(page.locator('.cart-line')).toHaveCount(1);
  await page.getByRole('button', { name: 'Eliminar Hoodie Compile' }).click();
  await expect(page.locator('.cart-line')).toHaveCount(0);
});

test('galería y guía de medidas conservan el foco y cierran con Escape', async ({ page }) => {
  await page.goto('/#/producto/camiseta-source');
  await page.getByRole('button', { name: 'Galería', exact: true }).click();
  await expect(page.locator('.gallery-main img')).toBeVisible();
  await page.getByRole('button', { name: 'Guía de tallas' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Guía de tallas' })).toBeFocused();
});

test('rutas RIWI sin desbordamiento ni imágenes rotas', async ({ page }, testInfo) => {
  await page.addInitScript(() => sessionStorage.setItem('riwi.reborn.intro.v1', 'seen'));
  for (const url of ['/', '/#/catalogo', '/#/producto/hoodie-compile', '/#/experiencia', '/#/colecciones', '/#/probador', '/#/carrito']) {
    await page.goto(url);
    await expect(page.locator('main h1')).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect.poll(() => page.locator('img').evaluateAll(images => {
      images.forEach(image => { (image as HTMLImageElement).loading = 'eager'; });
      return images.length > 0 && images.every(image => (image as HTMLImageElement).complete && (image as HTMLImageElement).naturalWidth > 0);
    })).toBe(true);
  }
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Probador virtual' }).click();
    await expect(page.getByRole('heading', { name: 'Tu cuerpo. Tu perspectiva.' })).toBeVisible();
  }
  await page.goto('/#/producto/desconocido');
  await expect(page.getByRole('heading', { name: /Esta ruta aún/ })).toBeVisible();
});

