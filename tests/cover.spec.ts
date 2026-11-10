import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('riwi.reborn.intro.v1', 'seen'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('cinco capítulos editoriales conducen a categorías reales', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('WEARTHE FUTURE.');
  await page.getByRole('button', { name: 'EXPLORE DROP 001' }).click();
  await expect(page.locator('#select-loadout h2')).toBeInViewport();
  await expect(page.locator('.reborn-home > section')).toHaveCount(5);
  await page.locator('.loadout-02 .loadout-link').click();
  await expect(page).toHaveURL(/catalogo\?categoria=camisetas/);
  await expect(page.locator('.product-card')).toHaveCount(2);
});

test('el primer Tab alcanza el enlace para saltar al contenido', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main-content')).toBeFocused();
});

test('Tech Orbit permite fijar un solo panel, clasifica correctamente y cierra con Escape', async ({
  page,
}) => {
  await page.goto('/');
  const js = page.getByRole('button', { name: 'Explorar tecnología JavaScript', exact: true });
  await js.focus();
  await js.press('Enter');
  await expect(js).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#tech-info-javascript')).toContainText('Lenguaje de programación');
  await page.keyboard.press('Escape');
  await expect(js).toHaveAttribute('aria-expanded', 'false');
  await expect(js).toBeFocused();
  const html = page.getByRole('button', { name: 'Explorar tecnología HTML', exact: true });
  await html.focus();
  await html.press('Enter');
  await expect(page.locator('#tech-info-html')).toContainText('Lenguaje de marcado');
  await expect(page.locator('.field-trigger[aria-expanded=true]')).toHaveCount(1);
  await expect(js).toHaveAttribute('aria-pressed', 'false');
  const panel = await page.locator('.tech-inspector').boundingBox();
  expect(panel).toBeTruthy();
  expect(panel!.x).toBeGreaterThanOrEqual(0);
  expect(panel!.x + panel!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(panel!.y + panel!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.getByRole('button', { name: 'Cerrar información de HTML', exact: true }).click();
  await expect(html).toHaveAttribute('aria-expanded', 'false');
});

test('terminal ejecuta comandos, conserva historial y navega al producto destacado', async ({
  page,
}) => {
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Comando de la terminal' });
  const log = page.getByRole('log', { name: 'Salida de la terminal' });
  await input.fill('help');
  await input.press('Enter');
  await expect(log).toContainText('COMANDOS DISPONIBLES');
  await input.fill('about');
  await input.press('Enter');
  await expect(log).toContainText('Be a coder. Change your world.');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('about');
  await input.press('ArrowUp');
  await expect(input).toHaveValue('help');
  await input.fill('clear');
  await input.press('Enter');
  await expect(log.locator('.terminal-line')).toHaveCount(0);
  await input.fill('shop');
  await input.press('Enter');
  await expect(page.locator('#code-collection h2')).toBeInViewport();
});

test('Add to Loadout guarda talla y color reales en el carrito persistente', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Seleccionar talla L', exact: true }).click();
  await page.getByRole('button', { name: 'Seleccionar color Violeta', exact: true }).click();
  await page.getByRole('button', { name: 'ADD TO LOADOUT', exact: true }).click();
  await expect(page.locator('.featured-cart-feedback')).toContainText('01 piezas');
  await page.locator('.featured-cart-feedback').getByRole('link', { name: 'Ver loadout' }).click();
  await expect(page.locator('.cart-line')).toHaveCount(1);
  await expect(page.getByRole('combobox', { name: 'Talla de Hoodie Compile' })).toHaveValue('L');
  await expect(page.getByRole('combobox', { name: 'Color de Hoodie Compile' })).toHaveValue(
    'Violeta',
  );
  await page.reload();
  await expect(page.locator('.cart-line')).toHaveCount(1);
});

test('Code to Fashion materializa geometría real y permite volver a la fuente', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Seleccionar talla L', exact: true }).click();
  await page.getByRole('button', { name: 'Seleccionar color Violeta', exact: true }).click();
  await expect(page.getByLabel('Código de tu selección')).toContainText('"L"');
  await expect(page.getByLabel('Código de tu selección')).toContainText('"Violeta"');
  await page.getByRole('button', { name: 'Materializar prenda 3D' }).click();
  await expect(page.getByTestId('product-viewer')).toHaveAttribute('data-model-status', 'ready');
  await expect(page.getByTestId('product-viewer')).toHaveCSS('backdrop-filter', 'none');
  await page.locator('.fashion-live .viewer-tools').scrollIntoViewIfNeeded();
  await expect(page.locator('.fashion-live .viewer-tools')).toBeInViewport();
  const canvas = page.getByTestId('product-viewer').locator('canvas');
  await expect(canvas).toBeVisible();
  const distance = Number(await canvas.getAttribute('data-camera-distance'));
  await page
    .getByTestId('product-viewer')
    .getByRole('button', { name: 'Acercar', exact: true })
    .click();
  await expect
    .poll(async () => Number(await canvas.getAttribute('data-camera-distance')))
    .toBeLessThan(distance);
  await page
    .locator('.fashion-mode-bar')
    .getByRole('button', { name: 'Foto', exact: true })
    .click();
  await page.getByRole('button', { name: 'VER ESPALDA' }).click();
  await expect(page.getByRole('img', { name: 'Hoodie Compile, vista posterior' })).toBeVisible();
  await page
    .locator('.fashion-mode-bar')
    .getByRole('button', { name: 'Código', exact: true })
    .click();
  await expect(page.getByLabel('Código de tu selección')).toBeVisible();
  await expect(page.locator('.fashion-live canvas')).toHaveCount(0);
});

test('búsqueda por teclado restaura el foco y abre una ficha real', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: 'Abrir búsqueda y comandos' });
  await trigger.click();
  await expect(page.getByRole('textbox', { name: 'Buscar en la tienda' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Control+k');
  await page.getByRole('textbox', { name: 'Buscar en la tienda' }).fill('hoodie');
  await page.getByRole('dialog').getByRole('button', { name: 'Hoodie Compile' }).click();
  await expect(page).toHaveURL(/producto\/hoodie-compile/);
});

test('mascota centrada, nítida y fija detrás del contenido en todo el recorrido', async ({
  page,
}) => {
  await page.goto('/');
  const mascot = page.getByRole('img', { name: /Mascota RIWI:/ });
  const initial = await mascot.boundingBox();
  expect(initial).toBeTruthy();
  expect(initial!.x + initial!.width / 2).toBeCloseTo(page.viewportSize()!.width / 2, 0);
  await expect(page.locator('.world-clean')).toHaveCSS('filter', 'blur(7px)');
  await expect(mascot).toHaveCSS('filter', 'none');
  for (const id of ['select-loadout', 'code-collection', 'built-by-coders', 'deploy-identity']) {
    await page.locator(`#${id}`).scrollIntoViewIfNeeded();
    expect(await mascot.boundingBox()).toEqual(initial);
    await expect(mascot).toBeInViewport();
    await expect(page.locator('.field-trigger')).toHaveCount(6);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page
    .locator('#deploy-identity')
    .getByRole('link', { name: 'EXPLORE THE COLLECTION' })
    .click();
  expect(await mascot.boundingBox()).toEqual(initial);
  expect(
    await page.locator('.mascot-plane').evaluate((node) => Number(getComputedStyle(node).zIndex)),
  ).toBeLessThan(
    await page
      .locator('.reborn-interface')
      .evaluate((node) => Number(getComputedStyle(node).zIndex)),
  );
});

test('iconos viajan por la pantalla, responden al scroll y se detienen con la pausa global', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const icon = page.locator('.field-orb').first();
  const initial = await icon.boundingBox();
  await expect
    .poll(async () => Math.abs((await icon.boundingBox())!.y - initial!.y))
    .toBeGreaterThan(8);
  await page.evaluate(() => scrollTo({ top: 1200, behavior: 'instant' }));
  await expect(page.locator('.field-trigger')).toHaveCount(6);
  await page.getByRole('button', { name: 'Pausar animaciones' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'paused');
  const paused = await icon.boundingBox();
  await page.waitForTimeout(350);
  expect(await icon.boundingBox()).toEqual(paused);
  await page.locator('.reborn-header .reborn-brand').click();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('los iconos no tienen recuadro y pasan detrás de los controles', async ({ page }) => {
  await page.goto('/');
  const trigger = page.locator('.field-trigger').first();
  await expect(trigger).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(trigger).toHaveCSS('border-top-width', '0px');
  await expect(trigger).toHaveCSS('box-shadow', 'none');
  const layers = await page.evaluate(() =>
    ['.tech-field', '.mascot-plane', '.reborn-interface'].map((selector) =>
      Number(getComputedStyle(document.querySelector(selector)!).zIndex),
    ),
  );
  expect(layers[0]).toBeLessThan(layers[1]);
  expect(layers[1]).toBeLessThan(layers[2]);
  const explore = page.getByRole('button', { name: 'EXPLORE DROP 001' });
  await explore.scrollIntoViewIfNeeded();
  const box = (await explore.boundingBox())!;
  // Deliberate geometric overlap proves stacking, rather than avoiding the foreground.
  await page
    .locator('.field-orb')
    .first()
    .evaluate((orb, box) => {
      (orb as HTMLElement).style.setProperty(
        'transform',
        `translate(${box.x + box.width / 2 - 24}px, ${box.y + box.height / 2 - 24}px)`,
        'important',
      );
    }, box);
  expect(
    await explore.evaluate((button) => {
      const r = button.getBoundingClientRect();
      return button.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    }),
  ).toBe(true);
  await explore.click();
  await expect(page.locator('#select-loadout h2')).toBeInViewport();
});

test('el scroll desplaza las prendas con parallax y la pausa deja legibles los capítulos', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const image = page.locator('.loadout-01 .parallax-media');
  await page.locator('#select-loadout .reveal-heading').scrollIntoViewIfNeeded();
  await expect(page.locator('#select-loadout .reveal-heading')).toHaveCSS('opacity', '1');
  await expect(page.locator('#select-loadout h2')).toHaveCSS('clip-path', 'inset(0px 0px 0%)');
  await image.scrollIntoViewIfNeeded();
  await expect(page.locator('.loadout-01')).toHaveCSS('opacity', '1');
  const before = await image.evaluate((node) => getComputedStyle(node).transform);
  await page.evaluate(() => scrollBy({ top: 220, behavior: 'instant' }));
  await expect
    .poll(() => image.evaluate((node) => getComputedStyle(node).transform))
    .not.toBe(before);
  await page.getByRole('button', { name: 'Pausar animaciones' }).click();
  await page.locator('#deploy-identity').scrollIntoViewIfNeeded();
  await expect(page.locator('#deploy-identity .scroll-reveal')).toHaveCSS('opacity', '1');
  await expect(page.locator('#deploy-identity .scroll-reveal')).toHaveCSS('clip-path', 'none');
  await page.locator('.reborn-header .reborn-brand').click();
  await expect(page.getByRole('heading', { level: 1 })).toBeInViewport();
});

test('la iluminación de las tarjetas sigue el cursor y se restablece al salir', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'El efecto depende de un puntero de mouse.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  const card = page.locator('.loadout-01 .loadout-card');
  await card.scrollIntoViewIfNeeded();
  await expect(page.locator('.loadout-01')).toHaveCSS('opacity', '1');
  await card.hover({ position: { x: 70, y: 85 } });
  await expect
    .poll(() => card.evaluate((node) => node.style.getPropertyValue('--glow-x')))
    .not.toBe('');
  const first = await card.evaluate((node) => node.style.getPropertyValue('--glow-x'));
  await card.hover({ position: { x: 160, y: 140 } });
  await expect
    .poll(() => card.evaluate((node) => node.style.getPropertyValue('--glow-x')))
    .not.toBe(first);
  await page.mouse.move(0, 0);
  await expect
    .poll(() => card.evaluate((node) => node.style.getPropertyValue('--pointer-dx')))
    .toBe('0px');
});
