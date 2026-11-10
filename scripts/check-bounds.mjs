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

for (const p of pieces.slice(0, 4)) {
  const m3d = findObj(p.mesh3D);
  const tf = findObj(m3d?.transform);
  const pcInfo = m3d?.positions?.pointCloud;
  if (!pcInfo) continue;
  
  const chunk = sbin.slice(pcInfo.offset + 8, pcInfo.offset + pcInfo.size);
  const buf = Buffer.from(chunk.toString('ascii'), 'base64');
  const decoder = new decoderModule.Decoder();
  const dracoBuffer = new decoderModule.DecoderBuffer();
  dracoBuffer.Init(new Int8Array(buf), buf.byteLength);
  const pc = new decoderModule.PointCloud();
  decoder.DecodeBufferToPointCloud(dracoBuffer, pc);
  const numPoints = pc.num_points();
  
  const posId = decoder.GetAttributeId(pc, decoderModule.POSITION);
  const posAttr = decoder.GetAttribute(pc, posId);
  const outData = new decoderModule.DracoFloat32Array();
  decoder.GetAttributeFloatForAllPoints(pc, posAttr, outData);
  
  // Local bounds
  let minLoc = [Infinity, Infinity, Infinity], maxLoc = [-Infinity, -Infinity, -Infinity];
  // Transformed bounds
  let mat = new THREE.Matrix4();
  if (tf?.matrix) {
    // Check if column-major or row-major
    mat.fromArray(tf.matrix);
  }
  let minWorld = [Infinity, Infinity, Infinity], maxWorld = [-Infinity, -Infinity, -Infinity];
  
  for (let i = 0; i < numPoints; i++) {
    const v = new THREE.Vector3(outData.GetValue(i*3), outData.GetValue(i*3+1), outData.GetValue(i*3+2));
    minLoc[0] = Math.min(minLoc[0], v.x); minLoc[1] = Math.min(minLoc[1], v.y); minLoc[2] = Math.min(minLoc[2], v.z);
    maxLoc[0] = Math.max(maxLoc[0], v.x); maxLoc[1] = Math.max(maxLoc[1], v.y); maxLoc[2] = Math.max(maxLoc[2], v.z);
    
    v.applyMatrix4(mat);
    minWorld[0] = Math.min(minWorld[0], v.x); minWorld[1] = Math.min(minWorld[1], v.y); minWorld[2] = Math.min(minWorld[2], v.z);
    maxWorld[0] = Math.max(maxWorld[0], v.x); maxWorld[1] = Math.max(maxWorld[1], v.y); maxWorld[2] = Math.max(maxWorld[2], v.z);
  }
  
  console.log(`Piece '${p._name}':`);
  console.log('  Local bounds:', minLoc.map(n=>n.toFixed(1)), 'to', maxLoc.map(n=>n.toFixed(1)));
  console.log('  World bounds:', minWorld.map(n=>n.toFixed(1)), 'to', maxWorld.map(n=>n.toFixed(1)));
}

