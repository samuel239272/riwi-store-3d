import fs from 'node:fs';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const loader = new OBJLoader();
const text = fs.readFileSync('imported_assets/raw_models/jacket.obj', 'utf-8');
const obj = loader.parse(text);

const box = new THREE.Box3().setFromObject(obj);
const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());
const scale = 2.35 / size.y;

const frontCenterVerts = [];
obj.traverse(c => {
  if (c.isMesh) {
    const pos = c.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = (pos.getX(i) - center.x) * scale;
      const y = (pos.getY(i) - center.y) * scale;
      const z = (pos.getZ(i) - center.z) * scale;
      if (Math.abs(x) < 0.03 && z > 0.25) {
        frontCenterVerts.push({ x, y, z });
      }
    }
  }
});

frontCenterVerts.sort((a, b) => a.y - b.y);
console.log('Front center verts count:', frontCenterVerts.length);
console.log('Lowest front center:', frontCenterVerts[0]);
console.log('Highest front center:', frontCenterVerts[frontCenterVerts.length - 1]);

