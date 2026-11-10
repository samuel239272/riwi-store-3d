import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));
const sbin = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');
const gm = data._objectsArrays[13]['186'].geoMesh.geoMeshData;
const chunk = sbin.slice(gm.offset, gm.offset + gm.size);

const normalEnd = 438368 + 8 + 36530 * 12;
console.log('Normals end at:', normalEnd);
for (let i = 0; i < 8; i++) {
  console.log(i, 'uint:', chunk.readUInt32LE(normalEnd + i * 4));
}

