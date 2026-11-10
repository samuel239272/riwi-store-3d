import draco3d from 'draco3d';
import fs from 'node:fs';

const decoderModule = await draco3d.createDecoderModule();
const data = JSON.parse(fs.readFileSync('imported_assets/chaque/project.json', 'utf-8'));
const sbin = fs.readFileSync('imported_assets/chaque/sbin0_decompressed.bin');

function findObj(id) {
  for (const arr of data._objectsArrays) {
    for (const k of Object.keys(arr)) {
      if (arr[k]?._id === id) return arr[k];
    }
  }
}

const pieces = [];
for (const arr of data._objectsArrays) {
  for (const k of Object.keys(arr)) {
    const item = arr[k];
    if (item && item._class === 3066423086) pieces.push(item);
  }
}
console.log('Pieces found:', pieces.length);

for (const p of pieces) {
  const m2d = findObj(p.mesh2D);
  const m3d = findObj(p.mesh3D);
  const tf = findObj(m3d?.transform);
  
  // Check m2d geoMesh
  const gm2d = m2d?.geoMesh?.geoMeshData;
  let m2dVerts = 0, m2dFaces = 0;
  if (gm2d) {
    const chunk = sbin.slice(gm2d.offset, gm2d.offset + gm2d.size);
    m2dVerts = chunk.readUInt32LE(0);
    let pos = 8 + m2dVerts * 12;
    const normCount = chunk.readUInt32LE(pos);
    pos += 8 + normCount * 12;
    const uvCount = chunk.readUInt32LE(pos);
    pos += 8 + uvCount * 12;
    m2dFaces = chunk.readUInt32LE(pos);
  }
  
  // Check m3d draco
  let dracoPoints = 0;
  if (m3d?.positions?.pointCloud) {
    const pcInfo = m3d.positions.pointCloud;
    const chunk = sbin.slice(pcInfo.offset + 8, pcInfo.offset + pcInfo.size);
    const buf = Buffer.from(chunk.toString('ascii'), 'base64');
    const decoder = new decoderModule.Decoder();
    const dracoBuffer = new decoderModule.DecoderBuffer();
    dracoBuffer.Init(new Int8Array(buf), buf.byteLength);
    const pc = new decoderModule.PointCloud();
    if (decoder.DecodeBufferToPointCloud(dracoBuffer, pc).ok()) {
      dracoPoints = pc.num_points();
    }
  }
  
  console.log(`Piece '${p._name}': m2dVerts=${m2dVerts}, m2dFaces=${m2dFaces}, dracoPoints=${dracoPoints}, tf=${tf?.matrix ? tf.matrix.slice(12, 15).map(n=>n.toFixed(1)) : 'none'}`);
}

