// Keep source GLBs intact. Re-encode embedded images; preserve all geometry/accessors.
import { chromium } from '@playwright/test';
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const browser = await chromium.launch({
  headless: true,
  executablePath: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find(existsSync),
});
mkdirSync('public/models/optimized', { recursive: true });
const results = [];
try {
  const page = await browser.newPage();
  for (const name of readdirSync('public/models/garments').filter((file) =>
    file.endsWith('.glb'),
  )) {
    const source = readFileSync(path.join('public/models/garments', name));
    const jsonLength = source.readUInt32LE(12);
    const json = JSON.parse(source.toString('utf8', 20, 20 + jsonLength));
    const binaryStart = 28 + jsonLength;
    const replacements = new Map();
    for (const image of json.images || []) {
      if (image.bufferView === undefined) continue;
      const view = json.bufferViews[image.bufferView];
      const original = source.subarray(
        binaryStart + (view.byteOffset || 0),
        binaryStart + (view.byteOffset || 0) + view.byteLength,
      );
      const encoded = await page.evaluate(
        async ({ data, mime }) => {
          const bytes = Uint8Array.from(atob(data), (char) => char.charCodeAt(0));
          const image = await createImageBitmap(new Blob([bytes], { type: mime }));
          const ratio = Math.min(1, 1024 / Math.max(image.width, image.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(image.width * ratio);
          canvas.height = Math.round(image.height * ratio);
          const context = canvas.getContext('2d');
          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          image.close();
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let alpha = false;
          for (let i = 3; i < pixels.length; i += 4)
            if (pixels[i] < 255) {
              alpha = true;
              break;
            }
          const output = canvas.toDataURL(alpha ? 'image/png' : 'image/jpeg', 0.92);
          return {
            data: output.split(',')[1],
            mime: alpha ? 'image/png' : 'image/jpeg',
            width: canvas.width,
            height: canvas.height,
          };
        },
        { data: original.toString('base64'), mime: image.mimeType },
      );
      const replacement = Buffer.from(encoded.data, 'base64');
      if (replacement.length < original.length) {
        replacements.set(image.bufferView, replacement);
        image.mimeType = encoded.mime;
      }
    }
    const pieces = [];
    let offset = 0;
    for (let index = 0; index < json.bufferViews.length; index++) {
      const view = json.bufferViews[index];
      const bytes =
        replacements.get(index) ||
        source.subarray(
          binaryStart + (view.byteOffset || 0),
          binaryStart + (view.byteOffset || 0) + view.byteLength,
        );
      view.byteOffset = offset;
      view.byteLength = bytes.length;
      const padding = (4 - (bytes.length % 4)) % 4;
      pieces.push(bytes, Buffer.alloc(padding));
      offset += bytes.length + padding;
    }
    json.buffers[0].byteLength = offset;
    const binary = Buffer.concat(pieces);
    const text = Buffer.from(JSON.stringify(json));
    const textPadded = Buffer.concat([text, Buffer.alloc((4 - (text.length % 4)) % 4, 32)]);
    const header = Buffer.alloc(20);
    header.writeUInt32LE(0x46546c67, 0);
    header.writeUInt32LE(2, 4);
    header.writeUInt32LE(28 + textPadded.length + binary.length, 8);
    header.writeUInt32LE(textPadded.length, 12);
    header.writeUInt32LE(0x4e4f534a, 16);
    const binHeader = Buffer.alloc(8);
    binHeader.writeUInt32LE(binary.length, 0);
    binHeader.writeUInt32LE(0x004e4942, 4);
    const output = Buffer.concat([header, textPadded, binHeader, binary]);
    writeFileSync(path.join('public/models/optimized', name), output);
    const result = {
      name,
      sourceBytes: source.length,
      optimizedBytes: output.length,
      imagesReencoded: replacements.size,
    };
    results.push(result);
    console.log(JSON.stringify(result));
  }
  writeFileSync('artifacts/garment-optimization.json', JSON.stringify(results, null, 2));
} finally {
  await browser.close();
}
