import { test, expect } from '@playwright/test';

test('movimiento reducido detiene el giro del maniquí', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#/probador');
  await expect(page.getByRole('button', { name: 'Girar maniquí automáticamente' })).toBeDisabled();
});

test('medidas válidas modifican el maniquí, inválidas conservan el modelo anterior', async ({ page })=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/#/probador');
  const viewer=page.getByTestId('fitting-viewer');
  await expect(viewer).toHaveAttribute('data-model-status','ready');
  await page.getByRole('spinbutton',{name:'Estatura cm',exact:true}).fill('188');
  await page.getByRole('spinbutton',{name:'Cintura cm',exact:true}).fill('103');
  await page.getByRole('button',{name:'Actualizar mi maniquí'}).click();
  await expect(viewer.locator('canvas')).toHaveAttribute('data-body-height','188');
  await expect(viewer.locator('canvas')).toHaveAttribute('data-body-waist','103');
  await page.getByRole('spinbutton',{name:'Peso kg',exact:true}).fill('0');
  await page.getByRole('button',{name:'Actualizar mi maniquí'}).click();
  await expect(page.getByRole('alert')).toContainText('Peso');
  await expect(viewer.locator('canvas')).toHaveAttribute('data-body-height','188');
  expect(await page.evaluate(()=>localStorage.getItem('riwi-body-profile-v1'))).toBeNull();
  await page.getByRole('button',{name:'Guardar en este equipo'}).click();
  await page.reload();
  await expect(page.getByRole('spinbutton',{name:'Estatura cm',exact:true})).toHaveValue('188');
  await page.getByRole('button',{name:'Borrar mis medidas'}).click();
  await expect(page.getByRole('spinbutton',{name:'Estatura cm',exact:true})).toHaveValue('175');
  expect(await page.evaluate(()=>localStorage.getItem('riwi-body-profile-v1'))).toBeNull();
  expect(errors).toEqual([]);
});

test('cada prenda se puede vestir y se conserva el color desde la ficha', async ({ page })=>{
  test.setTimeout(90000);
  await page.goto('/#/producto/hoodie-compile');
  await page.getByRole('button',{name:'Color Violeta',exact:true}).click();
  await page.getByRole('link',{name:/Probar en mi cuerpo/}).click();
  await expect(page.getByRole('button',{name:'Probar color Violeta'})).toHaveAttribute('aria-pressed','true');
  const viewer=page.getByTestId('fitting-viewer');
  for(const id of ['hoodie-compile','camiseta-source','camisa-runtime','jeans-branch','buzo-loop','sudadera-flow','gorra-commit','chaqueta-deploy']){
    await page.getByRole('combobox',{name:/Elige tu prenda/}).selectOption(id);
    await expect(viewer).toHaveAttribute('data-model-status','ready');
    await expect(viewer.locator('canvas')).toHaveAttribute('data-garment',id);
  }
  await page.getByRole('button',{name:'Espalda',exact:true}).click();
  await expect.poll(async()=>Number((await viewer.locator('canvas').getAttribute('data-camera-position'))?.split(',')[2])).toBeLessThan(-6);
});

test('datos locales dañados y ausencia de WebGL tienen alternativa usable', async ({ page })=>{
  await page.addInitScript(()=>{
    localStorage.setItem('riwi-body-profile-v1','{"height":null}');
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,id:string,...args:unknown[]){if(id.includes('webgl'))return null;return Reflect.apply(original,this,[id,...args]);} as typeof original;
  });
  await page.goto('/#/probador');
  await expect(page.getByTestId('fitting-viewer')).toHaveAttribute('data-model-status','fallback');
  await expect(page.getByRole('spinbutton',{name:'Estatura cm',exact:true})).toHaveValue('175');
  await expect(page.getByRole('link',{name:'Ver la prenda',exact:true})).toBeVisible();
});

