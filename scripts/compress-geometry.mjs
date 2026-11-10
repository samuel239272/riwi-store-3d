// Lossless attribute compression with the already-installed Meshopt encoder.
import { MeshoptEncoder } from 'meshoptimizer';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const sizes = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
const components = { 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 };
const report = JSON.parse(readFileSync('artifacts/garment-optimization.json', 'utf8'));
for (const name of readdirSync('public/models/optimized').filter((file) => file.endsWith('.glb'))) {
  const file = path.join('public/models/optimized', name);
  const original = readFileSync(file);
  const jsonLength = original.readUInt32LE(12);
  const json = JSON.parse(original.toString('utf8', 20, 20 + jsonLength));
  if (json.extensionsRequired?.includes('EXT_meshopt_compression'))
    throw new Error('Regenerate texture-optimized models before recompressing.');
  const binary = original.subarray(28 + jsonLength);
  const vertexViews = new Set(
    json.meshes.flatMap((mesh) =>
      mesh.primitives.flatMap((primitive) =>
        Object.values(primitive.attributes).map((index) => json.accessors[index].bufferView),
      ),
    ),
  );
  const pieces = [];
  let offset = 0;
  let encoded = 0;
  for (let index = 0; index < json.bufferViews.length; index++) {
    const view = json.bufferViews[index];
    const bytes = binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
    const accessor = json.accessors.find((item) => item.bufferView === index);
    const stride =
      view.byteStride || (accessor && sizes[accessor.type] * components[accessor.componentType]);
    let stored = bytes;
    if (
      vertexViews.has(index) &&
      stride &&
      stride % 4 === 0 &&
      stride <= 256 &&
      bytes.length % stride === 0
    ) {
      const count = bytes.length / stride;
      const compressed = MeshoptEncoder.encodeGltfBuffer(bytes, count, stride, 'ATTRIBUTES');
      const decoded = new Uint8Array(bytes.length);
      MeshoptDecoder.decodeGltfBuffer(decoded, count, stride, compressed, 'ATTRIBUTES', 'NONE');
      assert.deepEqual(Buffer.from(decoded), bytes, `${name}: lossless round trip`);
      if (compressed.length < bytes.length) {
        view.buffer = 1;
        view.extensions = {
          ...view.extensions,
          EXT_meshopt_compression: {
            buffer: 0,
            byteOffset: offset,
            byteLength: compressed.length,
            byteStride: stride,
            count,
            mode: 'ATTRIBUTES',
            filter: 'NONE',
          },
        };
        stored = Buffer.from(compressed);
        encoded++;
      }
    }
    if (!view.extensions?.EXT_meshopt_compression) {
      view.buffer = 0;
      view.byteOffset = offset;
    }
    const padding = (4 - (stored.length % 4)) % 4;
    pieces.push(stored, Buffer.alloc(padding));
    offset += stored.length + padding;
  }
  const fallbackSize = json.buffers[0].byteLength;
  json.buffers = [
    { byteLength: offset },
    { byteLength: fallbackSize, extensions: { EXT_meshopt_compression: { fallback: true } } },
  ];
  json.extensionsUsed = [...new Set([...(json.extensionsUsed || []), 'EXT_meshopt_compression'])];
  json.extensionsRequired = [
    ...new Set([...(json.extensionsRequired || []), 'EXT_meshopt_compression']),
  ];
  const jsonBytes = Buffer.from(JSON.stringify(json));
  const padded = Buffer.concat([jsonBytes, Buffer.alloc((4 - (jsonBytes.length % 4)) % 4, 32)]);
  const blob = Buffer.concat(pieces);
  const header = Buffer.alloc(20);
  header.writeUInt32LE(0x46546c67, 0);
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(28 + padded.length + blob.length, 8);
  header.writeUInt32LE(padded.length, 12);
  header.writeUInt32LE(0x4e4f534a, 16);
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(blob.length, 0);
  binHeader.writeUInt32LE(0x004e4942, 4);
  const output = Buffer.concat([header, padded, binHeader, blob]);
  writeFileSync(file, output);
  const result = report.find((item) => item.name === name);
  result.optimizedBytes = output.length;
  result.meshoptViews = encoded;
  console.log(JSON.stringify({ name, optimizedBytes: output.length, encodedViews: encoded }));
}
writeFileSync('artifacts/garment-optimization.json', JSON.stringify(report, null, 2));
