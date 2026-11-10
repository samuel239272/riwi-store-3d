/** High-fidelity garment models with official RIWI branding and PBR fabric textures. */
import { mkdir, writeFile } from 'node:fs/promises';
import { withStudio } from './studio-runner.mjs';

await mkdir('public/models/garments', { recursive: true });

await withStudio(async (page) => {
  for (const kind of ['hoodie', 'tee', 'sweatshirt', 'cap', 'jacket', 'shirt', 'jeans', 'joggers']) {
    console.log(`Exporting ${kind}...`);
    const dataUrl = await page.evaluate((k) => window.exportModel(k), kind);
    const base64 = dataUrl.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');
    await writeFile(`public/models/garments/${kind}.glb`, buffer);
    console.log(`✓ ${kind}.glb · ${Math.round(buffer.length / 1024)} KB · model ready`);
  }
});
