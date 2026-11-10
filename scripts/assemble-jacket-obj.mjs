import draco3d from 'draco3d';
import fs from 'node:fs';
import * as THREE from 'three';

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

console.log(`Processing ${pieces.length} cloth pieces...`);

let globalVertOffset = 0;
let totalVertices = 0;
let totalFaces = 0;

const outPositions = [];
const outUVs = [];
const outFaces = [];

let min = [Infinity, Infinity, Infinity];
let max = [-Infinity, -Infinity, -Infinity];

for (const p of pieces) {
  const m2d = findObj(p.mesh2D);
  const m3d = findObj(p.mesh3D);
  const tf = findObj(m3d?.transform);
  const pcInfo = m3d?.positions?.pointCloud;
  if (!pcInfo) continue;
  
  // Draco decode
  const chunk = sbin.slice(pcInfo.offset + 8, pcInfo.offset + pcInfo.size);
  const buf = Buffer.from(chunk.toString('ascii'), 'base64');
  const decoder = new decoderModule.Decoder();
  const dracoBuffer = new decoderModule.DecoderBuffer();
  dracoBuffer.Init(new Int8Array(buf), buf.byteLength);
  const pc = new decoderModule.PointCloud();
  if (!decoder.DecodeBufferToPointCloud(dracoBuffer, pc).ok()) {
    console.error('Failed to decode Draco for', p._name);
    continue;
  }
  
  const numPoints = pc.num_points();
  const posId = decoder.GetAttributeId(pc, decoderModule.POSITION);
  const posAttr = decoder.GetAttribute(pc, posId);
  const outData = new decoderModule.DracoFloat32Array();
  decoder.GetAttributeFloatForAllPoints(pc, posAttr, outData);
  
  // Transform matrix
  const mat = new THREE.Matrix4();
  if (tf?.matrix) {
    mat.fromArray(tf.matrix);
  }
  
  // GeoMesh from m2d for UVs and Faces
  const gm2d = m2d?.geoMesh?.geoMeshData;
  if (!gm2d) {
    console.warn('Missing gm2d for', p._name);
    continue;
  }
  
  const gmChunk = sbin.slice(gm2d.offset, gm2d.offset + gm2d.size);
  const vertCount = gmChunk.readUInt32LE(0);
  let pos = 8 + vertCount * 12;
  const normCount = gmChunk.readUInt32LE(pos);
  pos += 8 + normCount * 12;
  const uvCount = gmChunk.readUInt32LE(pos);
  pos += 8;
  const uvs = [];
  for (let i = 0; i < uvCount; i++) {
    const u = gmChunk.readFloatLE(pos);
    const v = gmChunk.readFloatLE(pos + 4);
    uvs.push([u, v]);
    pos += 12;
  }
  const triCount = gmChunk.readUInt32LE(pos);
  pos += 8;
  const faces = [];
  for (let i = 0; i < triCount; i++) {
    const i0 = gmChunk.readUInt32LE(pos);
    const i1 = gmChunk.readUInt32LE(pos + 4);
    const i2 = gmChunk.readUInt32LE(pos + 8);
    faces.push([i0 + globalVertOffset, i1 + globalVertOffset, i2 + globalVertOffset]);
    pos += 12;
  }
  
  console.log(`Piece '${p._name}': ${numPoints} verts, ${faces.length} faces, ${uvs.length} UVs`);
  
  // Save vertices
  for (let i = 0; i < numPoints; i++) {
    const v = new THREE.Vector3(outData.GetValue(i*3), outData.GetValue(i*3+1), outData.GetValue(i*3+2));
    v.applyMatrix4(mat);
    outPositions.push([v.x, v.y, v.z]);
    min[0] = Math.min(min[0], v.x); min[1] = Math.min(min[1], v.y); min[2] = Math.min(min[2], v.z);
    max[0] = Math.max(max[0], v.x); max[1] = Math.max(max[1], v.y); max[2] = Math.max(max[2], v.z);
  }
  
  // Save UVs
  for (let i = 0; i < numPoints; i++) {
    outUVs.push(uvs[i] || [0, 0]);
  }
  
  // Save faces
  for (const f of faces) {
    outFaces.push(f);
  }
  
  globalVertOffset += numPoints;
}

console.log('Total vertices:', outPositions.length);
console.log('Total faces:', outFaces.length);
console.log('Overall bounds:', min.map(n=>n.toFixed(1)), 'to', max.map(n=>n.toFixed(1)));

// Center and normalize coordinate system to match our other garments:
// In three.js store viewer:
// Height ~ 1.0 - 1.2 units (meter scale, centered around y = 0 or chest center)
// Let's compute scale and center
const sizeX = max[0] - min[0];
const sizeY = max[1] - min[1];
const sizeZ = max[2] - min[2];
console.log(`Dimensions (mm): width=${sizeX.toFixed(1)}, height=${sizeY.toFixed(1)}, depth=${sizeZ.toFixed(1)}`);

const centerX = (min[0] + max[0]) / 2;
const centerY = (min[1] + max[1]) / 2;
const centerZ = (min[2] + max[2]) / 2;

// Write OBJ
const stream = fs.createWriteStream('imported_assets/chaque/jacket_assembled.obj');
stream.write('# Style3D fully assembled jacket\n');
stream.write('o Jacket\n');

for (const [x, y, z] of outPositions) {
  stream.write(`v ${x.toFixed(4)} ${y.toFixed(4)} ${z.toFixed(4)}\n`);
}
for (const [u, v] of outUVs) {
  stream.write(`vt ${u.toFixed(4)} ${v.toFixed(4)}\n`);
}
for (const [i0, i1, i2] of outFaces) {
  stream.write(`f ${i0+1}/${i0+1} ${i1+1}/${i1+1} ${i2+1}/${i2+1}\n`);
}
stream.end(() => {
  console.log('Saved jacket_assembled.obj successfully!');
});

