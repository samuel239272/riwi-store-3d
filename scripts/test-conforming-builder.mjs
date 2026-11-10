import fs from 'node:fs';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const loader = new OBJLoader();

function createConformingPatch(targetGroup, {
  center,
  width,
  height,
  gridX = 24,
  gridY = 8,
  dir = new THREE.Vector3(0, 0, -1),
  rayOriginDistance = 1.0,
  normalOffset = 0.0035,
}) {
  const meshes = [];
  targetGroup.traverse(c => {
    if (c.isMesh) meshes.push(c);
  });

  const forward = dir.clone().normalize();
  const worldUp = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(worldUp, forward.clone().negate()).normalize();
  const up = new THREE.Vector3().crossVectors(forward.clone().negate(), right).normalize();

  const cVec = new THREE.Vector3(center.x, center.y, center.z);
  const geom = new THREE.PlaneGeometry(width, height, gridX, gridY);
  const posAttr = geom.attributes.position;
  const normAttr = geom.attributes.normal;

  const raycaster = new THREE.Raycaster();

  raycaster.set(cVec.clone().sub(forward.clone().multiplyScalar(rayOriginDistance)), forward);
  const centerHits = raycaster.intersectObjects(meshes, true);
  const baseHit = centerHits[0];
  const baseHitNormal = baseHit && baseHit.face ? baseHit.face.normal.clone().normalize() : forward.clone().negate();

  let hitsCount = 0;
  for (let iy = 0; iy <= gridY; iy++) {
    const vNorm = (iy / gridY) - 0.5;
    for (let ix = 0; ix <= gridX; ix++) {
      const uNorm = (ix / gridX) - 0.5;
      const vertIdx = iy * (gridX + 1) + ix;

      const pPlane = cVec.clone()
        .addScaledVector(right, uNorm * width)
        .addScaledVector(up, vNorm * height);

      const rayStart = pPlane.clone().sub(forward.clone().multiplyScalar(rayOriginDistance));
      raycaster.set(rayStart, forward);
      const hits = raycaster.intersectObjects(meshes, true);

      if (hits.length > 0) {
        hitsCount++;
        const hit = hits[0];
        const worldNormal = hit.face.normal.clone().normalize();
        const pFinal = hit.point.clone().addScaledVector(worldNormal, normalOffset);
        posAttr.setXYZ(vertIdx, pFinal.x, pFinal.y, pFinal.z);
        normAttr.setXYZ(vertIdx, worldNormal.x, worldNormal.y, worldNormal.z);
      } else {
        const pFinal = pPlane.clone().addScaledVector(baseHitNormal, normalOffset);
        posAttr.setXYZ(vertIdx, pFinal.x, pFinal.y, pFinal.z);
        normAttr.setXYZ(vertIdx, baseHitNormal.x, baseHitNormal.y, baseHitNormal.z);
      }
    }
  }

  posAttr.needsUpdate = true;
  normAttr.needsUpdate = true;
  console.log(`Patch vertices: ${posAttr.count}, hits: ${hitsCount}/${posAttr.count}`);
  return geom;
}

// Test on tee
const teeText = fs.readFileSync('imported_assets/raw_models/tee.obj', 'utf-8');
const teeObj = loader.parse(teeText);
const teeBox = new THREE.Box3().setFromObject(teeObj);
const teeSize = teeBox.getSize(new THREE.Vector3());
const teeCenter = teeBox.getCenter(new THREE.Vector3());
const teeScale = 2.35 / teeSize.y;
teeObj.traverse(c => {
  if (c.isMesh) {
    c.geometry = c.geometry.clone();
    c.geometry.translate(-teeCenter.x, -teeCenter.y, -teeCenter.z);
    c.geometry.scale(teeScale, teeScale, teeScale);
    c.geometry.computeVertexNormals();
  }
});
teeObj.updateMatrixWorld(true);

console.log('Testing conformal patch on Tee:');
const teePatch = createConformingPatch(teeObj, {
  center: { x: 0, y: 0.20, z: 0.47 },
  width: 0.44,
  height: 0.126,
});

// Test on jacket
const jktText = fs.readFileSync('imported_assets/raw_models/jacket.obj', 'utf-8');
const jktObj = loader.parse(jktText);
const jktBox = new THREE.Box3().setFromObject(jktObj);
const jktSize = jktBox.getSize(new THREE.Vector3());
const jktCenter = jktBox.getCenter(new THREE.Vector3());
const jktScale = 2.35 / jktSize.y;
jktObj.traverse(c => {
  if (c.isMesh) {
    c.geometry = c.geometry.clone();
    c.geometry.translate(-jktCenter.x, -jktCenter.y, -jktCenter.z);
    c.geometry.scale(jktScale, jktScale, jktScale);
    c.geometry.computeVertexNormals();
  }
});
jktObj.updateMatrixWorld(true);

console.log('Testing conformal patch on Jacket:');
const jktPatch = createConformingPatch(jktObj, {
  center: { x: -0.15, y: 0.18, z: 0.35 },
  width: 0.28,
  height: 0.08,
});

