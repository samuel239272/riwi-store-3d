import fs from 'node:fs';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const loader = new OBJLoader();
const text = fs.readFileSync('imported_assets/raw_models/cap_clean.obj', 'utf-8');
const obj = loader.parse(text);

obj.rotation.y = Math.PI;
obj.updateMatrixWorld(true);
const box = new THREE.Box3().setFromObject(obj);
const size = box.getSize(new THREE.Vector3());
const c = box.getCenter(new THREE.Vector3());
const scale = 1.25 / size.y;

obj.traverse(child => {
  if (child.isMesh) {
    child.geometry = child.geometry.clone();
    child.geometry.applyMatrix4(child.matrixWorld);
    child.geometry.translate(-c.x, -c.y, -c.z);
    child.geometry.scale(scale, scale, scale);
    child.geometry.computeVertexNormals();
  }
});
obj.position.set(0, 0, 0);
obj.rotation.set(0, 0, 0);
obj.updateMatrixWorld(true);

const meshes = [];
obj.traverse(ch => { if (ch.isMesh) meshes.push(ch); });

const raycaster = new THREE.Raycaster();
const dir = new THREE.Vector3(0, -0.3, -1).normalize();

const gridX = 16;
const gridY = 8;
let hits = 0;
let total = (gridX + 1) * (gridY + 1);
const center = { x: 0, y: 0.16, z: 0.53 };
const width = 0.24;
const height = 0.075;

for (let iy = 0; iy <= gridY; iy++) {
  const v = (iy / gridY) - 0.5;
  const y = center.y + v * height;
  for (let ix = 0; ix <= gridX; ix++) {
    const u = (ix / gridX) - 0.5;
    const x = center.x + u * width;
    const origin = new THREE.Vector3(x, y + 0.3, 1.2);
    raycaster.set(origin, dir);
    const intersects = raycaster.intersectObjects(meshes, true);
    if (intersects.length > 0) {
      hits++;
    }
  }
}
console.log(`[Cap] Hits: ${hits}/${total} (${((hits/total)*100).toFixed(1)}%)`);

