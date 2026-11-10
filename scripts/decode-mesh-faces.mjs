import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));
const sbin = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');
const gm = data._objectsArrays[13]['186'].geoMesh.geoMeshData;
const chunk = sbin.slice(gm.offset, gm.offset + gm.size);

let cur = 1315104;
console.log('At', cur, ':');
for (let i = 0; i < 8; i++) {
  console.log(i, 'uint:', chunk.readUInt32LE(cur + i * 4));
}

