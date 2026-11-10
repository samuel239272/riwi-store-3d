import fs from 'node:fs';

const buf = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');
const chunk = buf.slice(8093524, 8093524 + 67404);
console.log('Chunk length:', chunk.length);
console.log('Chunk hex first 64:', chunk.slice(0, 64).toString('hex'));
console.log('First 16 uint32:', Array.from({ length: 16 }, (_, i) => chunk.readUInt32LE(i * 4)));

