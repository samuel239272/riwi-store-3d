import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));
const sbin = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');

const dynamicMeshes = [];
for (const arr of data._objectsArrays || []) {
  for (const k of Object.keys(arr)) {
    const item = arr[k];
    if (item && item._class === 3102243693) {
      dynamicMeshes.push(item);
    }
  }
}
console.log('Total DynamicMesh objects found:', dynamicMeshes.length);

for (const dm of dynamicMeshes) {
  const gm = dm.geoMesh?.geoMeshData;
  if (!gm) continue;
  const chunk = sbin.slice(gm.offset, gm.offset + gm.size);
  const vertCount = chunk.readUInt32LE(0);
  
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < vertCount; i++) {
    const x = chunk.readFloatLE(8 + i * 12);
    const y = chunk.readFloatLE(8 + i * 12 + 4);
    const z = chunk.readFloatLE(8 + i * 12 + 8);
    for (let c = 0; c < 3; c++) {
      const v = [x, y, z][c];
      min[c] = Math.min(min[c], v);
      max[c] = Math.max(max[c], v);
    }
  }
  console.log(`DynamicMesh ${dm._name} (id=${dm._id}): verts=${vertCount}, bounds=`, min.map(n=>n.toFixed(1)), 'to', max.map(n=>n.toFixed(1)));
}

