import fs from 'node:fs';

const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));
const sbin = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');

const allGeoMeshes = [];
function findGeo(obj, path = '') {
  if (!obj || typeof obj !== 'object') return;
  if (obj.geoMeshData && typeof obj.geoMeshData.offset === 'number') {
    allGeoMeshes.push({ path, ...obj.geoMeshData });
  }
  for (const k of Object.keys(obj)) {
    if (typeof obj[k] === 'object') findGeo(obj[k], path + '.' + k);
  }
}
findGeo(data);
console.log('Total geoMeshData found:', allGeoMeshes.length);

for (let idx = 0; idx < allGeoMeshes.length; idx++) {
  const g = allGeoMeshes[idx];
  const chunk = sbin.slice(g.offset, g.offset + g.size);
  const count = chunk.readUInt32LE(0);
  let nonZeroZ = 0;
  for (let i = 0; i < Math.min(count, 500); i++) {
    const z = chunk.readFloatLE(8 + i * 12 + 8);
    if (Math.abs(z) > 0.001) nonZeroZ++;
  }
  if (nonZeroZ > 0) {
    console.log(`GeoMesh ${idx}: count=${count}, offset=${g.offset}, nonZeroZ=${nonZeroZ}, path=${g.path}`);
  }
}

