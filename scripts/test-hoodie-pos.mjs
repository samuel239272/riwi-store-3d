import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import fs from 'fs';

const text = fs.readFileSync('imported_assets/raw_models/hoodie.obj', 'utf8');
const loader = new OBJLoader();
const obj = loader.parse(text);

const box = new THREE.Box3().setFromObject(obj);
const size = new THREE.Vector3();
box.getSize(size);
const center = new THREE.Vector3();
box.getCenter(center);
const maxDim = Math.max(size.x, size.y, size.z);
const targetHeight = 2.35;
const s = targetHeight / maxDim;

obj.position.x = -center.x * s;
obj.position.y = -center.y * s;
obj.position.z = -center.z * s;
obj.scale.setScalar(s);
obj.updateMatrixWorld(true);

const raycaster = new THREE.Raycaster();
const testPoints = [
  { x: -0.20, y: 0.35 },
  { x: -0.22, y: 0.35 },
  { x: -0.24, y: 0.35 },
  { x: -0.20, y: 0.40 },
  { x: -0.22, y: 0.40 },
  { x: -0.24, y: 0.40 },
];

for (const p of testPoints) {
  raycaster.set(new THREE.Vector3(p.x, p.y, 2.0), new THREE.Vector3(0, 0, -1));
  const hits = raycaster.intersectObject(obj, true);
  if (hits.length > 0) {
    const hit = hits[0];
    console.log(`Hoodie (${p.x}, ${p.y}): hit at z=${hit.point.z.toFixed(4)}, normal=(${hit.normal?.x.toFixed(3)}, ${hit.normal?.y.toFixed(3)}, ${hit.normal?.z.toFixed(3)}), mesh=${hit.object.name}`);
  } else {
    console.log(`Hoodie (${p.x}, ${p.y}): NO HIT`);
  }
}
