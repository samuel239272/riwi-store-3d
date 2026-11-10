import fs from 'node:fs';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const loader = new OBJLoader();

async function testProjection(name, objPath, center, width, height) {
  const text = fs.readFileSync(objPath, 'utf-8');
  const obj = loader.parse(text);
  
  // Normalize and center like asset-studio does
  const box = new THREE.Box3().setFromObject(obj);
  const size = box.getSize(new THREE.Vector3());
  const c = box.getCenter(new THREE.Vector3());
  const scale = 2.35 / size.y;
  
  obj.traverse(child => {
    if (child.isMesh) {
      child.geometry = child.geometry.clone();
      child.geometry.applyMatrix4(child.matrixWorld);
      child.geometry.translate(-c.x, -c.y, -c.z);
      child.geometry.scale(scale, scale, scale);
      child.geometry.computeVertexNormals();
    }
  });
  obj.updateMatrixWorld(true);
  
  // Collect meshes
  const meshes = [];
  obj.traverse(ch => { if (ch.isMesh) meshes.push(ch); });
  
  const raycaster = new THREE.Raycaster();
  const dir = new THREE.Vector3(0, 0, -1);
  
  const gridX = 16;
  const gridY = 8;
  let hits = 0;
  let total = (gridX + 1) * (gridY + 1);
  
  for (let iy = 0; iy <= gridY; iy++) {
    const v = (iy / gridY) - 0.5;
    const y = center.y + v * height;
    for (let ix = 0; ix <= gridX; ix++) {
      const u = (ix / gridX) - 0.5;
      const x = center.x + u * width;
      const origin = new THREE.Vector3(x, y, 2.0);
      raycaster.set(origin, dir);
      const intersects = raycaster.intersectObjects(meshes, true);
      if (intersects.length > 0) {
        hits++;
      }
    }
  }
  console.log(`[${name}] Hits: ${hits}/${total} (${((hits/total)*100).toFixed(1)}%) at center:`, center);
}

await testProjection('Tee', 'imported_assets/raw_models/tee.obj', { x: 0, y: 0.20, z: 0.47 }, 0.44, 0.126);
await testProjection('Buzo', 'imported_assets/raw_models/buzo.obj', { x: 0, y: 0.22, z: 0.54 }, 0.42, 0.12);
await testProjection('Hoodie', 'imported_assets/raw_models/hoodie.obj', { x: 0, y: 0.15, z: 0.185 }, 0.35, 0.10);
await testProjection('Jacket', 'imported_assets/raw_models/jacket.obj', { x: -0.15, y: 0.18, z: 0.35 }, 0.28, 0.08);

