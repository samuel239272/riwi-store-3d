import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));
const sbin = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');
const gm = data._objectsArrays[13]['186'].geoMesh.geoMeshData;

console.log('GeoMesh 43 offset:', gm.offset, 'size:', gm.size);
const chunk = sbin.slice(gm.offset, gm.offset + gm.size);
console.log('Chunk length:', chunk.length);

// Header inspection
const vertCount = chunk.readUInt32LE(0);
const flag = chunk.readUInt32LE(4);
console.log('vertCount:', vertCount, 'flag:', flag);

// Each vertex: 3 floats (12 bytes)
const vertBytes = vertCount * 12;
console.log('Positions end at:', 8 + vertBytes);

let nextPos = 8 + vertBytes;
console.log('Next 8 uint32s after positions:');
for (let i = 0; i < 8; i++) {
  console.log(i, 'uint:', chunk.readUInt32LE(nextPos + i * 4));
}

