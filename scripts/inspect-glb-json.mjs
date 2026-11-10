import fs from 'node:fs';

const buf = fs.readFileSync('public/models/garments/jacket.glb');
console.log('GLB size:', buf.length);

// GLB header: magic (4), version (4), length (4)
const magic = buf.toString('ascii', 0, 4);
const version = buf.readUInt32LE(4);
const length = buf.readUInt32LE(8);
console.log({ magic, version, length });

// First chunk: JSON
const jsonChunkLength = buf.readUInt32LE(12);
const jsonChunkType = buf.toString('ascii', 16, 20);
const jsonStr = buf.toString('utf-8', 20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonStr);

console.log('GLTF JSON:');
console.log('  meshes:', gltf.meshes?.length);
console.log('  materials:', gltf.materials?.length);
console.log('  textures:', gltf.textures?.length);
console.log('  images:', gltf.images?.length);
console.log('  accessors:', gltf.accessors?.length);
console.log('  bufferViews:', gltf.bufferViews?.length);

for (const m of gltf.materials || []) {
  console.log('  material:', m.name, m.pbrMetallicRoughness);
}

