import fs from 'node:fs';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const loader = new OBJLoader();
const text = fs.readFileSync('imported_assets/raw_models/jacket.obj', 'utf-8');
const obj = loader.parse(text);

const box = new THREE.Box3().setFromObject(obj);
const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());

console.log('Raw jacket size (mm):', size.x.toFixed(1), size.y.toFixed(1), size.z.toFixed(1));
console.log('Raw jacket center (mm):', center.x.toFixed(1), center.y.toFixed(1), center.z.toFixed(1));

