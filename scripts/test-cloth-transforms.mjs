import fs from 'node:fs';
import * as THREE from 'three';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));
const sbin = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');

function findObj(id) {
  for (const arr of data._objectsArrays) {
    for (const k of Object.keys(arr)) {
      if (arr[k]?._id === id) return arr[k];
    }
  }
}

// Find all cloth pieces (class 3066423086)
const pieces = [];
for (const arr of data._objectsArrays) {
  for (const k of Object.keys(arr)) {
    const item = arr[k];
    if (item && item._class === 3066423086) {
      pieces.push(item);
    }
  }
}
console.log('Total cloth pieces:', pieces.length);

const group = new THREE.Group();

for (const p of pieces) {
  const mesh3d = findObj(p.mesh3D);
  const tf = findObj(mesh3d?.transform);
  if (!tf || !tf.matrix) {
    console.log('Missing transform for', p._name);
    continue;
  }
  
  const gm = p.coarseMesh?.geoMeshData;
  if (!gm) continue;
  
  const chunk = sbin.slice(gm.offset, gm.offset + gm.size);
  const vertCount = chunk.readUInt32LE(0);
  
  // Transform matrix
  // Style3D stores row-major or column-major 4x4 matrix
  const m = new THREE.Matrix4().fromArray(tf.matrix);
  
  console.log(`Piece ${p._name}: ${vertCount} verts, transform translation:`, tf.matrix.slice(12, 15));
}

