import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));
const sbin = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');
const gm = data._objectsArrays[13]['186'].geoMesh.geoMeshData;
const chunk = sbin.slice(gm.offset, gm.offset + gm.size);

const vertCount = chunk.readUInt32LE(0);
console.log('Parsing', vertCount, 'vertices...');

let pos = 8;
const positions = [];
for (let i = 0; i < vertCount; i++) {
  const x = chunk.readFloatLE(pos);
  const y = chunk.readFloatLE(pos + 4);
  const z = chunk.readFloatLE(pos + 8);
  positions.push([x, y, z]);
  pos += 12;
}

const normCount = chunk.readUInt32LE(pos);
pos += 8;
console.log('Parsing', normCount, 'normals...');
const normals = [];
for (let i = 0; i < normCount; i++) {
  const nx = chunk.readFloatLE(pos);
  const ny = chunk.readFloatLE(pos + 4);
  const nz = chunk.readFloatLE(pos + 8);
  normals.push([nx, ny, nz]);
  pos += 12;
}

const uvCount = chunk.readUInt32LE(pos);
pos += 8;
console.log('Parsing', uvCount, 'UVs...');
const uvs = [];
for (let i = 0; i < uvCount; i++) {
  const u = chunk.readFloatLE(pos);
  const v = chunk.readFloatLE(pos + 4);
  uvs.push([u, v]);
  pos += 12; // 3 floats per UV in chunk
}

const triCount = chunk.readUInt32LE(pos);
pos += 8;
console.log('Parsing', triCount, 'triangles...');
const faces = [];
for (let i = 0; i < triCount; i++) {
  const i0 = chunk.readUInt32LE(pos);
  const i1 = chunk.readUInt32LE(pos + 4);
  const i2 = chunk.readUInt32LE(pos + 8);
  faces.push([i0, i1, i2]);
  pos += 12;
}

console.log('Writing imported_assets/chaque/jacket.obj...');
const stream = fs.createWriteStream('imported_assets/chaque/jacket.obj');
stream.write('# Style3D extracted jacket\n');
stream.write('o Jacket\n');

for (const [x, y, z] of positions) {
  stream.write(`v ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}\n`);
}

for (const [nx, ny, nz] of normals) {
  stream.write(`vn ${nx.toFixed(4)} ${ny.toFixed(4)} ${nz.toFixed(4)}\n`);
}

for (const [u, v] of uvs) {
  stream.write(`vt ${u.toFixed(4)} ${v.toFixed(4)}\n`);
}

for (const [i0, i1, i2] of faces) {
  // OBJ indices are 1-based
  const a = i0 + 1;
  const b = i1 + 1;
  const c = i2 + 1;
  stream.write(`f ${a}/${a}/${a} ${b}/${b}/${b} ${c}/${c}/${c}\n`);
}

stream.end(() => {
  console.log('Successfully written jacket.obj!');
});

