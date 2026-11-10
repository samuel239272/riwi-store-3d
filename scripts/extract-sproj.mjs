import fs from 'node:fs';
import zlib from 'node:zlib';
import path from 'node:path';

const outDir = 'imported_assets/chaque';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const buf = fs.readFileSync('d:/chaque.sproj');
let pos = buf.length - 22;
while (pos > 0 && buf.readUInt32LE(pos) !== 0x06054b50) pos--;
const cdOffset = buf.readUInt32LE(pos + 16);
const cdCount = buf.readUInt16LE(pos + 10);

let cur = cdOffset;
for (let i = 0; i < cdCount; i++) {
  const method = buf.readUInt16LE(cur + 10);
  const compSize = buf.readUInt32LE(cur + 20);
  const uncompSize = buf.readUInt32LE(cur + 24);
  const nameLen = buf.readUInt16LE(cur + 28);
  const extraLen = buf.readUInt16LE(cur + 30);
  const commentLen = buf.readUInt16LE(cur + 32);
  const localHeaderOffset = buf.readUInt32LE(cur + 42);
  
  const rawName = buf.slice(cur + 46, cur + 46 + nameLen).toString('utf8');
  const safeName = rawName.replace(/[/\\:*?"<>|]/g, '_');
  
  const localNameLen = buf.readUInt16LE(localHeaderOffset + 26);
  const localExtraLen = buf.readUInt16LE(localHeaderOffset + 28);
  const dataStart = localHeaderOffset + 30 + localNameLen + localExtraLen;
  const compData = buf.slice(dataStart, dataStart + compSize);
  
  let uncompData;
  if (method === 0) {
    uncompData = compData;
  } else if (method === 8) {
    uncompData = zlib.inflateRawSync(compData);
  }
  
  fs.writeFileSync(path.join(outDir, safeName), uncompData);
  console.log(`Extracted: ${safeName} (${uncompData.length} bytes)`);
  cur += 46 + nameLen + extraLen + commentLen;
}
console.log('Extraction complete!');

