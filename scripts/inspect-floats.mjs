import fs from 'node:fs';

const buf = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');
const chunk = buf.slice(8093524, 8093524 + 67404);
console.log('Float values:');
for (let i = 0; i < 20; i++) {
  console.log(i, 'uint:', chunk.readUInt32LE(i * 4), 'float:', chunk.readFloatLE(i * 4));
}

