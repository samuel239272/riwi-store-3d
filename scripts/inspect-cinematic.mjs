import { chromium } from '@playwright/test';
import { existsSync, writeFileSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const source = process.argv[2];
if (!source || !existsSync(source)) throw new Error('Supply an existing source video.');
const browser = await chromium.launch({
  headless: true,
  executablePath: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find(existsSync),
  args: ['--allow-file-access-from-files'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto(pathToFileURL(path.resolve(source)).href);
  const video = page.locator('video');
  await video.waitFor();
  const metadata = await video.evaluate(async (element) => {
    element.pause();
    if (!element.duration)
      await new Promise((resolve) =>
        element.addEventListener('loadedmetadata', resolve, { once: true }),
      );
    return { duration: element.duration, width: element.videoWidth, height: element.videoHeight };
  });
  console.log(JSON.stringify(metadata));
  for (const [label, fraction] of [
    ['arrival', 0.1],
    ['landing', 0.45],
    ['mascot', 0.75],
    ['final', 0.99999],
  ]) {
    const data = await video.evaluate(async (element, fraction) => {
      await new Promise((resolve) => {
        element.addEventListener('seeked', resolve, { once: true });
        element.currentTime = element.duration * fraction;
      });
      const canvas = document.createElement('canvas');
      canvas.width = element.videoWidth;
      canvas.height = element.videoHeight;
      canvas.getContext('2d').drawImage(element, 0, 0);
      return canvas.toDataURL('image/webp', 0.92).split(',')[1];
    }, fraction);
    writeFileSync(`artifacts/cyber-${label}.webp`, Buffer.from(data, 'base64'));
  }
} finally {
  await browser.close();
}

const models = readdirSync('public/models/garments')
  .filter((name) => name.endsWith('.glb'))
  .map((name) => {
    const file = path.join('public/models/garments', name);
    const data = readFileSync(file);
    const jsonLength = data.readUInt32LE(12);
    const json = JSON.parse(data.toString('utf8', 20, 20 + jsonLength));
    const primitives = json.meshes.flatMap((mesh) => mesh.primitives);
    return {
      name,
      bytes: statSync(file).size,
      meshes: json.meshes.length,
      triangles: primitives.reduce(
        (sum, primitive) =>
          sum +
          (primitive.indices !== undefined
            ? json.accessors[primitive.indices].count / 3
            : json.accessors[primitive.attributes.POSITION].count / 3),
        0,
      ),
      textures: json.textures?.length || 0,
      extensions: json.extensionsUsed || [],
    };
  });
console.log(JSON.stringify(models));
