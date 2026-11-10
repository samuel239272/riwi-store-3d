import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const storageKey = 'riwi-coding-rewards-v1';
const answers = [
  '"Hola, RIWI!"',
  'envio + precio',
  '18 <= edad',
  'producto.stock > 0',
  'precio * 0.9',
  'await',
];
const money = (value: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('riwi.reborn.intro.v1', 'seen'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

async function solveDebug(page: Page, index: number) {
  await page.getByRole('textbox', { name: 'Completa el código' }).fill(answers[index]);
  await page.getByRole('button', { name: 'Validar solución', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Código ganado', exact: true })).toHaveValue(
    `RIWI-DEBUG-0${index + 1}`,
  );
}

async function solvePipeline(page: Page) {
  const rows = page.locator('.pipeline-lines li');
  const length = await rows.count();
  for (let target = 0; target < length; target++) {
    const ids = await rows.evaluateAll((nodes) =>
      nodes.map((node) => Number(node.getAttribute('data-line-id'))),
    );
    for (let position = ids.indexOf(target); position > target; position--) {
      await page
        .locator(`.pipeline-lines li[data-line-id="${target}"]`)
        .getByRole('button', { name: 'Subir línea' })
        .click();
    }
  }
  await page.getByRole('button', { name: 'Comprobar programa' }).click();
  await expect(page.locator('.challenge-feedback.won')).toContainText('¡Nivel superado!');
}

test('un error no desbloquea niveles; las pistas ayudan sin penalizar', async ({ page }) => {
  await page.goto('/#/retos');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    '¡Obtén códigos de descuento codificando!',
  );
  await expect(page.getByRole('button', { name: 'Nivel 2:' })).toBeDisabled();
  const answer = page.getByRole('textbox', { name: 'Completa el código' });
  await answer.fill('"Hola,RIWI!"'); // Whitespace inside a string matters.
  await page.getByRole('button', { name: 'Validar solución' }).click();
  await expect(page.locator('.challenge-feedback.wrong')).toContainText('Inténtalo otra vez');
  await expect(page.locator('.wallet-ticket')).toHaveCount(0);
  await expect(page.getByRole('progressbar', { name: 'Progreso total' })).toHaveAttribute(
    'value',
    '0',
  );
  await page.getByRole('button', { name: 'Validar solución' }).click();
  await expect(page.locator('.challenge-hint')).toBeVisible();
  await answer.fill("'Hola, RIWI!'");
  await answer.press('Enter');
  await expect(page.getByRole('textbox', { name: 'Código ganado' })).toHaveValue('RIWI-DEBUG-01');
  await expect(page.getByRole('button', { name: 'Nivel 2:' })).toBeEnabled();
  await expect(page.locator('.wallet-ticket')).toHaveCount(1);
});

test('Debug Quest: seis niveles, recompensas únicas y progreso persistente', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/#/retos');
  for (let index = 0; index < 6; index++) {
    await solveDebug(page, index);
    await expect(page.locator('.wallet-ticket')).toHaveCount(index + 1);
    if (index < 5) await page.getByRole('button', { name: 'Siguiente nivel' }).click();
  }
  await expect(page.locator('.reward-unlocked')).toContainText('15 %');
  await page.getByRole('button', { name: 'Reiniciar reto' }).click();
  await solveDebug(page, 5);
  await expect(page.locator('.wallet-ticket')).toHaveCount(6);
  await page.reload();
  await expect(page.getByRole('progressbar', { name: 'Progreso total' })).toHaveAttribute(
    'value',
    '6',
  );
  await expect(page.getByRole('button', { name: 'Nivel 6:' })).toHaveAttribute(
    'aria-current',
    'step',
  );
  await expect(page.locator('.wallet-ticket')).toHaveCount(6);
});

test('Build Pipeline: valida el orden y completa seis programas progresivos', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/#/retos?juego=pipeline');
  await page.getByRole('button', { name: 'Comprobar programa' }).click();
  await expect(page.locator('.challenge-feedback.wrong')).toBeVisible();
  await expect(page.locator('.wallet-ticket')).toHaveCount(0);
  for (let index = 0; index < 6; index++) {
    await solvePipeline(page);
    await expect(page.getByRole('textbox', { name: 'Código ganado' })).toHaveValue(
      `RIWI-PIPELINE-0${index + 1}`,
    );
    if (index < 5) await page.getByRole('button', { name: 'Siguiente nivel' }).click();
  }
  await expect(page.locator('.wallet-ticket')).toHaveCount(6);
  await page.getByRole('button', { name: 'Explorar otro reto' }).click();
  await expect(page).toHaveURL(/juego=debug/);
  await expect(page.getByRole('button', { name: 'Nivel 2:' })).toBeDisabled();
  await expect(page.getByRole('progressbar', { name: 'Progreso total' })).toHaveAttribute(
    'value',
    '6',
  );
});

test('el código ganado descuenta el carrito, recalcula cantidades y aparece en la descarga', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('/#/retos');
  await solveDebug(page, 0);
  await page.getByRole('button', { name: 'Usar en el carrito' }).click();
  await expect(page.locator('.empty-cart-reward')).toContainText('RIWI-DEBUG-01');
  await page.getByRole('link', { name: 'Explorar colección', exact: true }).first().click();
  await page.goto('/#/producto/camiseta-hello'); // Price 89,000, current promotion 75,000.
  await page.getByRole('button', { name: 'Agregar al carrito' }).click();
  await page.getByRole('link', { name: 'Ver carrito', exact: true }).click();
  await expect(page.getByTestId('cart-discount')).toHaveText('−' + money(2250));
  await expect(page.getByTestId('cart-payable')).toHaveText(money(72750));
  await page.getByRole('button', { name: 'Aumentar cantidad de Camiseta Hello World' }).click();
  await expect(page.getByTestId('cart-payable')).toHaveText(money(145500));
  const downloading = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Guardar mi selección' }).click();
  const file = await downloading;
  const contents = await readFile((await file.path())!, 'utf8');
  expect(contents).toContain('RIWI-DEBUG-01 (3 %)');
  expect(contents).toContain(`Total con descuento: ${money(145500)}`);
  await page.reload();
  await expect(page.getByTestId('cart-payable')).toHaveText(money(145500));
  await page.getByRole('button', { name: 'Quitar descuento' }).click();
  await expect(page.getByTestId('cart-payable')).toHaveText(money(150000));
  await page.getByRole('textbox', { name: 'Código de descuento' }).fill('RIWI-DEBUG-06');
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
  await expect(page.locator('.coupon-error')).toContainText('no está desbloqueado');
  await expect(page.getByTestId('cart-payable')).toHaveText(money(150000));
  await page.getByRole('textbox', { name: 'Código de descuento' }).fill('  riwi-debug-01  ');
  await page.getByRole('button', { name: 'Aplicar', exact: true }).click();
  await expect(page.getByTestId('cart-payable')).toHaveText(money(145500));
  await page.goto('/#/retos');
  await solveDebug(page, 1);
  await page.getByRole('button', { name: 'Usar en el carrito' }).click();
  await expect(page.getByTestId('cart-payable')).toHaveText(money(142500)); // 5%, not 3% + 5%.
  await page.getByRole('button', { name: 'Eliminar Camiseta Hello World' }).click();
  await expect(page.locator('.cart-empty')).toContainText('RIWI-DEBUG-02');
});

test('datos locales inválidos no desbloquean niveles ni inventan descuentos', async ({ page }) => {
  await page.addInitScript(
    (key) =>
      localStorage.setItem(
        key,
        JSON.stringify({
          version: 1,
          completed: ['debug:3', 'pipeline:0', 'pipeline:0', 'unknown'],
          activeCode: 'RIWI-DEBUG-04',
        }),
      ),
    storageKey,
  );
  await page.goto('/#/retos');
  await expect(page.locator('.wallet-ticket')).toHaveCount(1);
  await expect(page.locator('.wallet-ticket')).toContainText('RIWI-PIPELINE-01');
  await expect(page.getByRole('button', { name: 'Nivel 2:' })).toBeDisabled();
  await page.getByRole('link', { name: 'Ir al carrito', exact: true }).click();
  await expect(page.locator('.empty-cart-reward')).toHaveCount(0);
});

test('se puede jugar si el almacenamiento está bloqueado', async ({ page }) => {
  await page.addInitScript((key) => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.call(this, name, value);
    };
  }, storageKey);
  await page.goto('/#/retos');
  await expect(page.locator('.arena-pass')).toContainText('el progreso durará esta sesión');
  await solveDebug(page, 0);
  await expect(page.locator('.wallet-ticket')).toHaveCount(1);
});

test('navegación, teclado, concentración y tamaños pequeños', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Empezar a codificar', exact: true }).click();
  await expect(page).toHaveURL(/#\/retos$/);
  const focus = page.getByRole('button', { name: 'Modo concentración' });
  await focus.click();
  await expect(focus).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.tech-field')).toHaveCSS('visibility', 'hidden');
  await page.reload();
  await expect(focus).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('group', { name: 'Elige un minijuego' })
    .getByRole('button', { name: /Build Pipeline/ })
    .focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/juego=pipeline/);
  await page.getByRole('button', { name: 'Subir línea 3', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.pipeline-lines li').nth(1)).toHaveAttribute('data-line-id', '0');
  await page.setViewportSize({ width: 320, height: 740 });
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
  await page.getByRole('link', { name: 'Mis recompensas, 0 códigos' }).click();
  await expect(
    page.getByRole('heading', { name: 'Tus códigos, listos para usar.' }),
  ).toBeInViewport();
  expect(errors).toEqual([]);
});
