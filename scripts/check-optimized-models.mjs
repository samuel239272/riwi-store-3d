import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
await MeshoptDecoder.ready;

function load(file) {
  const bytes = readFileSync(file);
  const length = bytes.readUInt32LE(12);
  assert.equal(bytes.readUInt32LE(8), bytes.length, 'GLB header length');
  return {
    json: JSON.parse(bytes.toString('utf8', 20, 20 + length)),
    binary: bytes.subarray(28 + length),
  };
}
for (const name of readdirSync('public/models/optimized')) {
  const original = load(path.join('public/models/garments', name));
  const optimized = load(path.join('public/models/optimized', name));
  for (const property of ['meshes', 'nodes', 'materials', 'accessors', 'scenes'])
    assert.deepEqual(optimized.json[property], original.json[property], `${name}: ${property}`);
  const images = new Set(original.json.images.map((image) => image.bufferView));
  original.json.bufferViews.forEach((view, index) => {
    if (images.has(index)) return;
    const next = optimized.json.bufferViews[index];
    const extension = next.extensions?.EXT_meshopt_compression;
    let data = optimized.binary.subarray(
      next.byteOffset || 0,
      (next.byteOffset || 0) + next.byteLength,
    );
    if (extension) {
      data = Buffer.alloc(extension.count * extension.byteStride);
      MeshoptDecoder.decodeGltfBuffer(
        data,
        extension.count,
        extension.byteStride,
        optimized.binary.subarray(
          extension.byteOffset,
          extension.byteOffset + extension.byteLength,
        ),
        extension.mode,
        extension.filter,
      );
    }
    assert.deepEqual(
      original.binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength),
      data,
      `${name}: buffer view ${index}`,
    );
  });
  console.log(`${name}: geometry, materials, UVs and scene hierarchy preserved`);
}
