import {
  Box3,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
  type BufferGeometry,
  type Material,
} from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { assetUrl } from '../utils/assets';
import { referenceBody, type BodyModel, type BodyProfile } from '../utils/bodyProfile';
import type { CategoryId } from '../types/product';

const cache = new Map<string, Promise<Group>>();
export function loadFittingModel(url: string): Promise<Group> {
  const existing = cache.get(url);
  if (existing) return existing;
  const draco = new DRACOLoader().setDecoderPath(assetUrl('/decoders/draco/'));
  const loader = new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);
  const request = loader
    .loadAsync(url)
    .then((gltf) => {
      draco.dispose();
      return gltf.scene;
    })
    .catch((error: unknown) => {
      cache.delete(url);
      draco.dispose();
      throw error;
    });
  cache.set(url, request);
  return request;
}

export interface FittingMesh extends Mesh<BufferGeometry, Material | Material[]> {
  userData: { original: Float32Array; [key: string]: unknown };
}

/** Flatten transforms into private geometry; cached source geometry/materials stay untouched. */
export function cloneFittingModel(source: Group): Group {
  const result = new Group();
  source.updateMatrixWorld(true);
  source.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const geometry = object.geometry.clone().applyMatrix4(object.matrixWorld);
    const material = Array.isArray(object.material)
      ? object.material.map((m) => m.clone())
      : object.material.clone();
    const mesh = new Mesh(geometry, material);
    mesh.name = object.name;
    mesh.userData.original = new Float32Array(geometry.getAttribute('position').array);
    geometry.setAttribute(
      'fittingReference',
      new Float32BufferAttribute(mesh.userData.original, 3),
    );
    result.add(mesh);
  });
  return result;
}

export function disposeFittingModel(model: Group) {
  model.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    o.geometry.dispose();
    for (const material of [o.material].flat()) material.dispose();
  });
  // Textures belong to the cached source. Do not dispose them when switching garments.
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
function smooth(a: number, b: number, value: number) {
  const t = clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}
function between(t: number, knots: [number, number][]) {
  for (let i = 1; i < knots.length; i++) {
    if (t <= knots[i][0]) {
      const [a, x] = knots[i - 1],
        [b, y] = knots[i];
      return x + (y - x) * smooth(a, b, t);
    }
  }
  return knots[knots.length - 1][1];
}

/** Regional deformation in a common, 3.5-unit reference body. The head is protected. */
export function deformPoint(
  x: number,
  y: number,
  z: number,
  p: BodyProfile,
  model: BodyModel,
): [number, number, number] {
  const base = referenceBody(model),
    h = p.height / 175,
    heightRatio = p.height / base.height;
  const t = (y + 1.75) / 3.5;
  const mass = clamp(Math.sqrt(p.weight / base.weight) / heightRatio, 0.68, 1.65);
  const chest = p.chest / base.chest,
    waist = p.waist / base.waist,
    hips = p.hips / base.hips;
  const width = between(t, [
    [0, 1],
    [0.12, 0.95 + mass * 0.05],
    [0.38, 0.45 + mass * 0.55],
    [0.52, hips],
    [0.64, waist],
    [0.74, chest],
    [0.81, p.shoulders / base.shoulders],
    [0.87, 1],
    [1, 1],
  ]);
  const depth = between(t, [
    [0, 1],
    [0.14, 1],
    [0.43, 0.45 + mass * 0.55],
    [0.52, hips],
    [0.64, waist * (0.8 + mass * 0.2)],
    [0.74, chest],
    [0.85, 1],
    [1, 1],
  ]);
  const arm = smooth(0.27, 0.46, Math.abs(x)) * smooth(0.4, 0.5, t) * (1 - smooth(0.8, 0.87, t));
  // Expand limbs about their centres instead of stretching hands away from the body.
  const limbCenter = Math.sign(x) * (0.37 + (0.8 - t) * 0.24);
  const limbX = limbCenter * (p.shoulders / base.shoulders) + (x - limbCenter) * mass;
  const bodyX = x * width;
  const leg = clamp(p.inseam / base.inseam / heightRatio, 0.78, 1.22);
  const crotch = -0.14;
  const stretchedY =
    y < crotch
      ? -1.75 + (y + 1.75) * leg
      : -1.75 +
        (crotch + 1.75) * leg +
        ((y - crotch) * (3.5 - (crotch + 1.75) * leg)) / (1.75 - crotch);
  return [
    (bodyX * (1 - arm) + limbX * arm) * h,
    stretchedY * h,
    z * (depth * (1 - arm) + mass * arm) * h,
  ];
}

export function deformBody(group: Group, profile: BodyProfile, model: BodyModel, skin: string) {
  group.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    const mesh = o as FittingMesh,
      position = mesh.geometry.getAttribute('position');
    const original = mesh.userData.original;
    for (let i = 0; i < position.count; i++) {
      position.setXYZ(
        i,
        ...deformPoint(original[i * 3], original[i * 3 + 1], original[i * 3 + 2], profile, model),
      );
    }
    position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
    for (const material of [mesh.material].flat()) {
      if (material instanceof MeshStandardMaterial && material.name === 'body-skin') {
        material.color.set(skin);
        material.roughness = 0.64;
      }
    }
  });
}

/** Register the actual catalog mesh once, preserving its UVs, trims, logos and topology. */
export function registerGarment(group: Group, category: CategoryId, model: BodyModel) {
  const bounds = new Box3().setFromObject(group),
    size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const bottom = category === 'jeans' || category === 'sudaderas';
  const cap = category === 'accesorios',
    hoodie = category === 'hoodies';
  const low = cap ? 1.46 : bottom ? -1.64 : -0.2;
  const high = cap ? 1.91 : bottom ? 0.28 : hoodie ? 1.79 : 1.22;
  const scale = cap ? 0.54 / size.x : (high - low) / size.y;
  group.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    const mesh = o as FittingMesh,
      position = mesh.geometry.getAttribute('position');
    for (let i = 0; i < position.count; i++) {
      let x = (position.getX(i) - center.x) * scale;
      let y = (position.getY(i) - bounds.min.y) * scale + low;
      let z = (position.getZ(i) - center.z) * scale + (cap ? 0.05 : 0.015);
      if (bottom) {
        const leg = 1 - smooth(-0.45, -0.16, y);
        const splay =
          model === 'male'
            ? between(y, [
                [-1.75, 0.22],
                [-1.2, 0.16],
                [-0.8, 0.07],
                [-0.4, -0.04],
                [0, 0],
              ])
            : 0;
        const sign = Math.sign(x);
        const legX = sign * 0.22 + (x - sign * 0.22) * 0.86 + sign * splay;
        x = legX * leg + x * 0.84 * (1 - leg);
        z -= 0.06 + 0.12 * leg;
      } else if (category === 'camisetas' || category === 'chaquetas') {
        const weight = smooth(0.29, 0.49, Math.abs(x)) * (1 - smooth(1.06, 1.2, y));
        const sign = Math.sign(x),
          angle = 0.38 * sign;
        const dx = x - sign * 0.31,
          dy = y - 1.02;
        const posedX = sign * 0.31 + Math.cos(angle) * dx + Math.sin(angle) * dy;
        const posedY = 1.02 - Math.sin(angle) * dx + Math.cos(angle) * dy;
        x += (posedX - x) * weight;
        y += (posedY - y) * weight;
      }
      position.setXYZ(i, x, y, z);
    }
    mesh.userData.original = new Float32Array(position.array);
    mesh.geometry.setAttribute(
      'fittingReference',
      new Float32BufferAttribute(mesh.userData.original, 3),
    );
    if (bottom) {
      for (const material of [mesh.material].flat()) {
        material.onBeforeCompile = (shader) => {
          shader.vertexShader =
            'attribute vec3 fittingReference;\nvarying float fittingY;\n' + shader.vertexShader;
          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            '#include <begin_vertex>\nfittingY = fittingReference.y;',
          );
          shader.fragmentShader = 'varying float fittingY;\n' + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <clipping_planes_fragment>',
            '#include <clipping_planes_fragment>\nif (fittingY > -.15) discard;',
          );
        };
        material.customProgramCacheKey = () => 'fitting-trousers-under-top';
        material.needsUpdate = true;
      }
    }
  });
}

export function deformGarment(
  group: Group,
  profile: BodyProfile,
  model: BodyModel,
  color: string,
  relaxed: boolean,
  category: CategoryId,
) {
  const ease = relaxed ? 1.12 : 1.035;
  group.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    const mesh = o as FittingMesh,
      original = mesh.userData.original;
    const position = mesh.geometry.getAttribute('position');
    for (let i = 0; i < position.count; i++) {
      const x = original[i * 3],
        y = original[i * 3 + 1],
        z = original[i * 3 + 2];
      const point =
        category === 'accesorios'
          ? ([
              (x * profile.height) / 175,
              (y * profile.height) / 175,
              (z * profile.height) / 175,
            ] as [number, number, number])
          : deformPoint(x, y, z, profile, model);
      position.setXYZ(i, point[0] * ease, point[1], point[2] * ease);
    }
    position.needsUpdate = true;
    mesh.geometry.computeVertexNormals();
    mesh.geometry.computeBoundingBox();
    mesh.geometry.computeBoundingSphere();
    for (const material of [mesh.material].flat()) {
      if (material instanceof MeshStandardMaterial && material.name === 'fabric')
        material.color.set(color);
    }
  });
}

/** Hide skin only beneath clothing; full original geometry remains available in body view. */
export function coverBody(group: Group, category: CategoryId) {
  const bottom = category === 'jeans' || category === 'sudaderas';
  group.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    for (const material of [o.material].flat()) {
      if (!(material instanceof MeshStandardMaterial) || material.name !== 'body-skin') continue;
      material.onBeforeCompile = (shader) => {
        shader.vertexShader =
          'attribute vec3 fittingReference;\nvarying vec3 fittingLocal;\n' + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nfittingLocal = fittingReference;',
        );
        shader.fragmentShader = 'varying vec3 fittingLocal;\n' + shader.fragmentShader;
        // Every dressed avatar also wears a complementary catalog underlayer.
        const topLow = bottom ? 0.07 : -0.14;
        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <clipping_planes_fragment>',
          `#include <clipping_planes_fragment>\nif ((fittingLocal.y > -1.56 && fittingLocal.y < .20 && abs(fittingLocal.x) < .49) || (fittingLocal.y > ${topLow} && fittingLocal.y < 1.12 && abs(fittingLocal.x) < .34) || (fittingLocal.y > .86 && fittingLocal.y < 1.12)) discard;`,
        );
      };
      material.customProgramCacheKey = () => 'fitting-covered-' + category;
      material.needsUpdate = true;
    }
  });
}
