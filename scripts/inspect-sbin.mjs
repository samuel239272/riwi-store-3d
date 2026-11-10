import fs from 'node:fs';

const buf = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');
console.log('Total length:', buf.length);

// Let's find where non-zero data begins
let firstNonZero = 0;
while (firstNonZero < buf.length && buf[firstNonZero] === 0) firstNonZero++;
console.log('First non-zero byte at offset:', firstNonZero);

// Print the first 64 bytes of non-zero data
console.log('Non-zero hex:', buf.slice(firstNonZero, firstNonZero + 64).toString('hex'));
console.log('Non-zero floats:');
const floats = [];
for (let i = 0; i < 16; i++) {
  floats.push(buf.readFloatLE(firstNonZero + i * 4));
}
console.log(floats);

