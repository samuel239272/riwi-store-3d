import fs from 'node:fs';
import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

const loader = new OBJLoader();
const text = fs.readFileSync('imported_assets/chaque/jacket.obj', 'utf-8');
const obj = loader.parse(text);
const mesh = obj.children[0];
const pos = mesh.geometry.attributes.position;

let countBelow700 = 0;
let countAbove700 = 0;
for (let i = 0; i < pos.count; i++) {
  const y = pos.getY(i);
  if (y < 700) countBelow700++;
  else countAbove700++;
}
console.log('Vertices below y=700 (legs/feet):', countBelow700);
console.log('Vertices above y=700 (torso/arms/collar):', countAbove700);

