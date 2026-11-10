import fs from 'node:fs';

const sbin = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');
const chunk = sbin.slice(1370652, 1370652 + 32356);

console.log('pointCloud chunk length:', chunk.length);
const count = chunk.readUInt32LE(0);
console.log('count:', count);
for (let i = 0; i < 10; i++) {
  const x = chunk.readFloatLE(8 + i * 12);
  const y = chunk.readFloatLE(8 + i * 12 + 4);
  const z = chunk.readFloatLE(8 + i * 12 + 8);
  console.log(i, 'x:', x, 'y:', y, 'z:', z);
}

