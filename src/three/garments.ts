import * as T from 'three';
import { bodyDimensions, defaultBody, type BodyProfile } from '../utils/bodyProfile';
import { getFabricTextures, getLeatherJacronTexture, type FabricPattern } from './textures';

export type GarmentKind = 'hoodie' | 'tee' | 'shirt' | 'jeans' | 'sweatshirt' | 'joggers' | 'cap' | 'jacket';

export type Ring = [number, number, number, number?, number?]; // [y, rx, rz, cx?, cz?]

export const add = (
  g: T.Group,
  geo: T.BufferGeometry,
  mat: T.Material,
  pos: [number, number, number] = [0, 0, 0],
  rot: [number, number, number] = [0, 0, 0]
) => {
  const m = new T.Mesh(geo, mat);
  m.position.set(...pos);
  m.rotation.set(...rot);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
};

// -------------------------------------------------------------
// ORGANIC CLOTH SHELL GENERATOR
// Simulates natural fabric drape, gravitational cascades, and wrinkles
// -------------------------------------------------------------
export function shell(rings: Ring[], segments = 64, folds = 0) {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const numRings = rings.length;

  rings.forEach((ring, r) => {
    const [y, a, b] = ring;
    const cx = ring[3] ?? 0;
    const cz = ring[4] ?? 0;
    const vFactor = r / (numRings - 1);

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;

      // Authentic clothing fold dynamics:
      // Gravitational drape, lateral tension lines, and soft micro-slubs
      const foldWave = folds > 0 ? (
        Math.sin(angle * 6 + r * 1.5) * 0.45 +
        Math.cos(angle * 2.5 - r * 0.9) * 0.35 +
        Math.sin(angle * 11 + r * 2.2) * 0.20
      ) * Math.sin(vFactor * Math.PI) * folds : 0;

      const px = cx + Math.sin(angle) * (a + foldWave);
      const pz = cz + Math.cos(angle) * (b + foldWave);

      positions.push(px, y, pz);
      uvs.push(i / segments, vFactor);

      if (r > 0 && i > 0) {
        const current = r * (segments + 1) + i;
        const prev = current - 1;
        const below = (r - 1) * (segments + 1) + i;
        const belowPrev = below - 1;
        indices.push(current, prev, belowPrev, current, belowPrev, below);
      }
    }
  });

  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function tubeFromPoints(
  g: T.Group,
  points: T.Vector3[],
  material: T.Material,
  radius = 0.005,
  tubularSegments = 36,
  radialSegments = 8,
  closed = false
) {
  if (points.length < 2) return null;
  const curve = new T.CatmullRomCurve3(points);
  const geo = new T.TubeGeometry(curve, tubularSegments, radius, radialSegments, closed);
  return add(g, geo, material);
}

export function seam(g: T.Group, points: T.Vector3[], material: T.Material, radius = 0.0045) {
  return tubeFromPoints(g, points, material, radius, 36, 6, false);
}

// Generates an articulated curved limb with natural elbow/knee drapery
function curvedLimb(
  g: T.Group,
  from: T.Vector3,
  mid: T.Vector3,
  to: T.Vector3,
  r1: number,
  r2: number,
  r3: number,
  material: T.Material,
  folds = 0.004,
  segments = 32
) {
  const curve = new T.CatmullRomCurve3([from, mid, to]);
  const steps = 22;
  const rings: Ring[] = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const pt = curve.getPoint(t);
    const r = t < 0.5 ? r1 * (1 - t * 2) + r2 * (t * 2) : r2 * (1 - (t - 0.5) * 2) + r3 * ((t - 0.5) * 2);
    const jointFactor = 1 + (1 - Math.abs(t - 0.5) * 2) * 0.08;
    rings.push([pt.y, r * jointFactor, r * 0.94 * jointFactor, pt.x, pt.z]);
  }

  const geo = shell(rings, segments, folds);
  return add(g, geo, material);
}

function brandPatch(
  g: T.Group,
  logo: T.Texture | undefined,
  y: number,
  a: number,
  b: number,
  width: number,
  height: number,
  zOffset = 0.014,
  xOffset = 0
) {
  if (!logo) return;
  const material = new T.MeshStandardMaterial({
    name: 'brand',
    map: logo,
    transparent: true,
    roughness: 0.62,
    metalness: 0.04,
    side: T.DoubleSide,
    polygonOffset: true,
    polygonOffsetFactor: -3,
    polygonOffsetUnits: -3,
  });

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const cols = 32;
  const rows = 4;

  for (let r = 0; r <= rows; r++) {
    const v = r / rows;
    const py = y + (v - 0.5) * height;
    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const px = xOffset + (u - 0.5) * width;
      const radFactor = Math.max(0.04, 1 - (px / a) ** 2);
      const pz = b * Math.sqrt(radFactor) + zOffset;
      positions.push(px, py, pz);
      uvs.push(u, v);

      if (r > 0 && c > 0) {
        const curr = r * (cols + 1) + c;
        const prev = curr - 1;
        const below = (r - 1) * (cols + 1) + c;
        const belowPrev = below - 1;
        indices.push(curr, prev, belowPrev, curr, belowPrev, below);
      }
    }
  }

  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  add(g, geometry, material);
}

// -------------------------------------------------------------
// HIGH-FASHION BOUTIQUE DISPLAY MANNEQUIN
// -------------------------------------------------------------
export function createBody(profile: BodyProfile, skin = '#c4bccf') {
  const d = bodyDimensions(profile);
  const g = new T.Group();

  const skinMat = new T.MeshStandardMaterial({
    color: skin,
    roughness: 0.48,
    metalness: 0.16,
  });

  const accentMat = new T.MeshStandardMaterial({
    color: new T.Color(skin).multiplyScalar(0.82),
    roughness: 0.42,
    metalness: 0.28,
  });

  // Torso with athletic contour
  const torsoGeo = shell([
    [d.hipY - 0.16, d.hips * 0.98, d.hips * 0.67, 0, 0.01],
    [d.hipY - 0.03, d.hips * 1.02, d.hips * 0.69, 0, 0.015],
    [d.waistY - 0.09, d.waist * 0.97, d.waist * 0.66, 0, 0],
    [d.waistY + 0.07, d.waist * 1.01, d.waist * 0.67, 0, -0.01],
    [d.chestY - 0.04, d.chest * 0.98, d.chest * 0.70, 0, 0.022],
    [d.chestY + 0.11, d.chest * 1.02, d.chest * 0.73, 0, 0.028],
    [d.shoulderY - 0.07, d.shoulder * 0.96, 0.18, 0, 0.01],
    [d.shoulderY, 0.19, 0.145, 0, 0],
  ], 56, 0);
  add(g, torsoGeo, skinMat);

  // Ergonomic Neck
  const neck = add(g, new T.CylinderGeometry(0.105, 0.138, 0.23, 32), skinMat, [0, d.shoulderY + 0.09, 0]);
  neck.rotation.x = -0.04;

  // Sculpted Mannequin Head
  const headTop = d.h / 2 - 0.25;
  const head = add(g, new T.SphereGeometry(1, 36, 26), skinMat, [0, headTop, 0]);
  head.scale.set(0.182, 0.255, 0.205);

  const faceFacet = add(g, new T.ConeGeometry(0.14, 0.22, 5), accentMat, [0, headTop - 0.06, 0.138], [-0.3, 0, 0]);
  faceFacet.scale.set(1, 1, 0.45);

  // Limbs with deltoids, natural bend and stylized footwear
  for (const side of [-1, 1]) {
    const shPt = new T.Vector3(side * (d.shoulder * 0.94), d.shoulderY - 0.04, 0);
    const elPt = new T.Vector3(side * (d.shoulder + 0.13), d.waistY + 0.08, 0.03);
    const wrPt = new T.Vector3(side * (d.shoulder + 0.22), d.hipY - 0.20, 0.08);

    const deltoid = add(g, new T.SphereGeometry(1, 24, 18), skinMat, [shPt.x, shPt.y, shPt.z]);
    deltoid.scale.set(0.12 * d.fullness, 0.13 * d.fullness, 0.11 * d.fullness);

    curvedLimb(g, shPt, elPt, wrPt, 0.11 * d.fullness, 0.085 * d.fullness, 0.058 * d.fullness, skinMat, 0);

    const hand = add(g, new T.BoxGeometry(0.044, 0.15, 0.08), accentMat, [wrPt.x + side * 0.02, wrPt.y - 0.09, wrPt.z + 0.01]);
    hand.rotation.z = side * -0.15;

    const hipPt = new T.Vector3(side * (d.hips * 0.50), d.hipY - 0.05, 0);
    const kneePt = new T.Vector3(side * (d.hips * 0.51), -d.h / 2 + d.leg * 0.49, 0.035);
    const anklePt = new T.Vector3(side * (d.hips * 0.52), -d.h / 2 + 0.13, 0.01);

    curvedLimb(g, hipPt, kneePt, anklePt, 0.165 * d.fullness, 0.11 * d.fullness, 0.068 * d.fullness, skinMat, 0);

    const shoe = add(g, new T.BoxGeometry(0.09, 0.085, 0.24), accentMat, [anklePt.x, -d.h / 2 + 0.055, anklePt.z + 0.05]);
    shoe.rotation.x = 0.04;
  }

  return g;
}

// -------------------------------------------------------------
// EXPONENTIALLY REALISTIC 3D GARMENTS
// -------------------------------------------------------------
export function createGarment(
  kind: GarmentKind,
  profile: BodyProfile = defaultBody,
  color = '#a99aff',
  logo?: T.Texture,
  fit: 'regular' | 'relaxed' = 'regular'
) {
  const d = bodyDimensions(profile);
  const g = new T.Group();
  const ease = fit === 'relaxed' ? 0.082 : 0.045;

  const patternType: FabricPattern = kind === 'jeans' ? 'denim' : kind === 'cap' ? 'canvas' : 'cotton';
  const texBundle = getFabricTextures(patternType, kind === 'jeans' ? 28 : 22);
  const ribTexBundle = getFabricTextures('ribbed', 24);

  // Main PBR Fabric Material (kept as name: 'fabric' for live color switcher)
  const fabric = new T.MeshStandardMaterial({
    name: 'fabric',
    color,
    map: texBundle?.diffuseMap,
    roughness: kind === 'jeans' ? 0.88 : 0.80,
    metalness: 0.02,
    normalMap: texBundle?.normalMap,
    roughnessMap: texBundle?.roughnessMap,
    normalScale: new T.Vector2(0.42, 0.42),
    side: T.DoubleSide,
  });

  // Rib-knit trim for cuffs, hems, collar
  const trim = new T.MeshStandardMaterial({
    color: new T.Color(color).multiplyScalar(0.82),
    map: ribTexBundle?.diffuseMap,
    roughness: 0.88,
    metalness: 0.01,
    normalMap: ribTexBundle?.normalMap,
    roughnessMap: ribTexBundle?.roughnessMap,
    normalScale: new T.Vector2(0.70, 0.70),
    side: T.DoubleSide,
  });

  // Darker inner lining material for hooded interior, pockets and folds
  const lining = new T.MeshStandardMaterial({
    color: new T.Color(color).multiplyScalar(0.68),
    roughness: 0.92,
    metalness: 0.01,
    normalMap: texBundle?.normalMap,
    side: T.BackSide,
  });

  // Contrast & decorative seam threads
  const stitchColor = kind === 'jeans' ? new T.Color('#d49b42') : new T.Color(color).lerp(new T.Color('#ffffff'), 0.44);
  const stitch = new T.MeshStandardMaterial({
    color: stitchColor,
    roughness: 0.58,
    metalness: 0.06,
  });

  // Metallic Hardware
  const chrome = new T.MeshStandardMaterial({
    color: '#e6ebf5',
    metalness: 0.94,
    roughness: 0.16,
  });

  const brass = new T.MeshStandardMaterial({
    color: '#c29653',
    metalness: 0.86,
    roughness: 0.26,
  });

  const copper = new T.MeshStandardMaterial({
    color: '#b86236',
    metalness: 0.88,
    roughness: 0.32,
  });

  const pearl = new T.MeshStandardMaterial({
    color: '#f8f7f2',
    roughness: 0.18,
    metalness: 0.12,
  });

  // =========================================================
  // PANTS: JEANS OR JOGGERS
  // =========================================================
  if (kind === 'jeans' || kind === 'joggers') {
    const isDenim = kind === 'jeans';
    const a = d.hips + ease;
    const b = d.hips * 0.71 + ease;
    const waistR = d.waist + ease;
    const waistZ = b * 0.92;
    const waistTop = d.hipY + 0.25;
    const crotchY = d.hipY - 0.29;

    // Multi-ring pelvis shell with natural abdominal curve and seat shape
    const pelvisRings: Ring[] = [
      [crotchY, a * 0.87, b * 0.93, 0, 0.01],
      [d.hipY - 0.18, a * 0.95, b * 0.97, 0, 0.022],
      [d.hipY - 0.06, a * 1.02, b * 1.02, 0, 0.018],
      [d.hipY + 0.07, a * 0.99, b * 0.97, 0, 0.008],
      [d.hipY + 0.18, waistR * 1.015, waistZ * 1.015, 0, 0],
      [waistTop, waistR, waistZ, 0, -0.005],
    ];
    add(g, shell(pelvisRings, 56, isDenim ? 0.006 : 0.010), fabric);

    // Sculpted Waistband with realistic thickness and top/bottom edge seams
    const bandHeight = 0.068;
    const bandRings: Ring[] = [
      [waistTop - bandHeight, waistR + 0.009, waistZ + 0.009, 0, -0.005],
      [waistTop, waistR + 0.010, waistZ + 0.010, 0, -0.005],
    ];
    add(g, shell(bandRings, 56, 0), isDenim ? fabric : trim);

    // Waistband top & bottom edge stitch lines
    for (const h of [waistTop - bandHeight + 0.005, waistTop - 0.005]) {
      const wStitch = add(g, new T.TorusGeometry(waistR + 0.011, 0.0035, 6, 52), stitch, [0, h, -0.005]);
      wStitch.rotation.x = Math.PI / 2;
      wStitch.scale.set(1, waistZ / waistR, 1);
    }

    if (isDenim) {
      // 1. Center brass shank button with concave face and engraved center
      const btn = add(g, new T.CylinderGeometry(0.017, 0.017, 0.008, 24), brass, [0, waistTop - bandHeight * 0.5, waistZ + 0.015], [Math.PI / 2, 0, 0]);
      btn.scale.set(1, 0.6, 1);
      add(g, new T.CylinderGeometry(0.007, 0.007, 0.009, 16), brass, [0, waistTop - bandHeight * 0.5, waistZ + 0.017], [Math.PI / 2, 0, 0]);

      // 2. J-stitch fly flap seam (classic denim curved zipper fly)
      seam(g, [
        new T.Vector3(0.012, waistTop - bandHeight, waistZ + 0.010),
        new T.Vector3(0.012, d.hipY + 0.08, b * 0.97),
        new T.Vector3(0.048, d.hipY - 0.03, b * 0.99),
        new T.Vector3(0.01, crotchY + 0.06, b * 0.94),
      ], stitch, 0.0045);

      // Bar-tack stitch reinforcement at the base of the J-fly
      seam(g, [
        new T.Vector3(0.005, crotchY + 0.06, b * 0.94),
        new T.Vector3(0.025, crotchY + 0.06, b * 0.94),
      ], stitch, 0.006);

      // 3. 5 Belt loops (presillas de cinturón) with stitched borders
      const loopAngles = [-Math.PI * 0.28, -Math.PI * 0.11, 0, Math.PI * 0.11, Math.PI * 0.28];
      loopAngles.forEach((ang) => {
        const lx = Math.sin(ang) * (waistR + 0.014);
        const lz = Math.cos(ang) * (waistZ + 0.014);
        const loop = add(g, new T.BoxGeometry(0.015, bandHeight * 1.18, 0.008), fabric, [lx, waistTop - bandHeight * 0.5, lz]);
        loop.rotation.y = ang;
      });

      // 4. Front curved scoop pockets with copper rivets & coin pocket
      for (const side of [-1, 1]) {
        seam(g, [
          new T.Vector3(side * 0.06, waistTop - bandHeight, waistZ + 0.010),
          new T.Vector3(side * (waistR * 0.56), d.hipY + 0.09, waistZ * 0.96),
          new T.Vector3(side * (a * 0.88), d.hipY - 0.07, b * 0.55),
        ], stitch, 0.0048);

        // Copper rivets at pocket stress corners
        add(g, new T.SphereGeometry(0.0065, 14, 10), copper, [side * (a * 0.86), d.hipY - 0.06, b * 0.58]);
        add(g, new T.SphereGeometry(0.0065, 14, 10), copper, [side * 0.065, waistTop - bandHeight, waistZ + 0.012]);

        // Right-side coin pocket (bolsillo relojero) with selvage stitch and copper rivets
        if (side === 1) {
          const coinPts = [
            new T.Vector3(0.075, d.hipY + 0.08, waistZ * 0.97),
            new T.Vector3(0.145, d.hipY + 0.08, waistZ * 0.95),
            new T.Vector3(0.145, d.hipY + 0.01, waistZ * 0.96),
            new T.Vector3(0.075, d.hipY + 0.01, waistZ * 0.97),
          ];
          seam(g, coinPts, stitch, 0.0038);
          add(g, new T.SphereGeometry(0.005, 12, 8), copper, [0.078, d.hipY + 0.08, waistZ * 0.98]);
          add(g, new T.SphereGeometry(0.005, 12, 8), copper, [0.142, d.hipY + 0.08, waistZ * 0.96]);
        }
      }

      // 5. Rear Yoke seam (Canesú posterior en V) & 2 Pentagonal patch pockets
      seam(g, [
        new T.Vector3(-a * 0.86, d.hipY + 0.13, -b * 0.62),
        new T.Vector3(0, d.hipY + 0.045, -b * 0.99),
        new T.Vector3(a * 0.86, d.hipY + 0.13, -b * 0.62),
      ], stitch, 0.005);

      for (const side of [-1, 1]) {
        const px = side * 0.145;
        const py = d.hipY - 0.04;
        const pz = -b * 0.99;

        // Double-stitched pentagonal back pocket outline
        const pocketOutline = [
          new T.Vector3(px - side * 0.075, py + 0.085, pz),
          new T.Vector3(px + side * 0.075, py + 0.085, pz),
          new T.Vector3(px + side * 0.07, py - 0.065, pz),
          new T.Vector3(px, py - 0.115, pz),
          new T.Vector3(px - side * 0.07, py - 0.065, pz),
          new T.Vector3(px - side * 0.075, py + 0.085, pz),
        ];
        seam(g, pocketOutline, stitch, 0.0045);

        // Classic decorative double V embroidery
        seam(g, [
          new T.Vector3(px - side * 0.055, py + 0.025, pz - 0.002),
          new T.Vector3(px, py - 0.035, pz - 0.002),
          new T.Vector3(px + side * 0.055, py + 0.025, pz - 0.002),
        ], stitch, 0.004);
      }

      // 6. Authentic Embossed Leather Jacron Patch on Rear Right Waistband
      const jacronTex = getLeatherJacronTexture();
      if (jacronTex) {
        const jacronMat = new T.MeshStandardMaterial({
          map: jacronTex,
          roughness: 0.68,
          metalness: 0.06,
          side: T.DoubleSide,
        });
        const jacron = add(g, new T.BoxGeometry(0.11, 0.055, 0.004), jacronMat, [0.135, waistTop - bandHeight * 0.5, -waistZ * 0.985]);
        jacron.rotation.y = -0.15;
      }
    } else {
      // JOGGER: Ruched gathered elastic waistband with drawstring
      for (const side of [-1, 1]) {
        add(g, new T.TorusGeometry(0.013, 0.0045, 8, 18), chrome, [side * 0.038, waistTop - bandHeight * 0.5, waistZ + 0.013], [Math.PI / 2, 0, 0]);
      }
      // Thick braided cords with realistic drape knot
      const tieL = [
        new T.Vector3(-0.038, waistTop - bandHeight * 0.5, waistZ + 0.014),
        new T.Vector3(-0.028, waistTop - 0.09, waistZ + 0.038),
        new T.Vector3(-0.045, waistTop - 0.19, waistZ + 0.028),
      ];
      const tieR = [
        new T.Vector3(0.038, waistTop - bandHeight * 0.5, waistZ + 0.014),
        new T.Vector3(0.028, waistTop - 0.085, waistZ + 0.042),
        new T.Vector3(0.035, waistTop - 0.20, waistZ + 0.030),
      ];
      seam(g, tieL, stitch, 0.0055);
      seam(g, tieR, stitch, 0.0055);
      add(g, new T.CylinderGeometry(0.006, 0.006, 0.028, 16), chrome, [-0.045, waistTop - 0.19, waistZ + 0.028]);
      add(g, new T.CylinderGeometry(0.006, 0.006, 0.028, 16), chrome, [0.035, waistTop - 0.20, waistZ + 0.030]);

      // 3D Cargo flap pockets on outer thighs
      for (const side of [-1, 1]) {
        const cargoY = d.hipY - 0.22;
        const cargoX = side * (a * 0.94);
        const cargoPouch = add(g, new T.BoxGeometry(0.025, 0.14, 0.13), fabric, [cargoX, cargoY, 0.04]);
        cargoPouch.rotation.z = side * -0.04;
        const cargoFlap = add(g, new T.BoxGeometry(0.03, 0.04, 0.135), trim, [cargoX, cargoY + 0.07, 0.04]);
        cargoFlap.rotation.z = side * -0.04;
        add(g, new T.SphereGeometry(0.007, 12, 8), chrome, [cargoX + side * 0.015, cargoY + 0.06, 0.04]);
      }
    }

    // Legs: Realistic knee break, accordion drape folds, and hem
    for (const side of [-1, 1]) {
      const legX = side * (d.hips * 0.52);
      const kneeY = -d.h / 2 + d.leg * 0.49;
      const ankleY = -d.h / 2 + 0.12;

      const legRings: Ring[] = [
        [ankleY, 0.096 * d.fullness + ease, 0.089 + ease, 0, 0.005],
        [ankleY + 0.12, 0.106 * d.fullness + ease, 0.097 + ease, 0, 0.012],
        [kneeY - 0.10, 0.125 * d.fullness + ease, 0.112 * d.fullness + ease, 0, 0.022],
        [kneeY, 0.142 * d.fullness + ease, 0.125 * d.fullness + ease, 0, 0.026],
        [kneeY + 0.14, 0.158 * d.fullness + ease, 0.146 * d.fullness + ease, 0, 0.018],
        [d.hipY - 0.20, 0.185 * d.fullness + ease, 0.180 * d.fullness + ease, 0, 0],
      ];
      const leg = add(g, shell(legRings, 48, isDenim ? 0.008 : 0.014), fabric, [legX, 0, 0]);
      leg.rotation.z = side * 0.012;

      // Outer and inner double-stitched flat-felled outseams
      seam(g, [
        new T.Vector3(legX + side * 0.145, d.hipY - 0.18, 0.02),
        new T.Vector3(legX + side * 0.148, kneeY, 0.025),
        new T.Vector3(legX + side * 0.115, ankleY, 0.015),
      ], stitch, isDenim ? 0.0048 : 0.0038);

      if (!isDenim) {
        // Elastic gathered ankle cuffs for Jogger
        const cuffH = 0.075;
        const cuffRings: Ring[] = [
          [ankleY - cuffH, 0.082 * d.fullness + ease, 0.075 + ease],
          [ankleY + 0.01, 0.096 * d.fullness + ease, 0.088 + ease],
        ];
        add(g, shell(cuffRings, 36, 0), trim, [legX, 0, 0]);
      } else {
        // Jean folded hem with chainstitch ring and subtle turn-up cuff
        const hemStitch = add(g, new T.TorusGeometry(0.099 * d.fullness + ease, 0.0042, 8, 36), stitch, [legX, ankleY + 0.015, 0]);
        hemStitch.rotation.x = Math.PI / 2;
        // Inner turned-up hem cuff rim
        const cuffTurnup = add(g, new T.CylinderGeometry(0.10 * d.fullness + ease, 0.10 * d.fullness + ease, 0.022, 36, 1, true), trim, [legX, ankleY + 0.018, 0]);
        cuffTurnup.scale.set(1, 1, 0.94);
      }
    }

    // RIWI brand patch on back waistband
    brandPatch(g, logo, waistTop - bandHeight * 0.5, waistR, -waistZ * 0.98, 0.22, 0.065, -0.014);
  }

  // =========================================================
  // HEADWEAR: CAP
  // =========================================================
  else if (kind === 'cap') {
    const top = d.h / 2 - 0.21;
    const r = 0.22;

    // 6-panel structured crown dome
    add(g, new T.SphereGeometry(r, 52, 36, 0, Math.PI * 2, 0, Math.PI * 0.52), fabric, [0, top, 0]);

    // Top fabric squatchee button
    const topBtn = add(g, new T.SphereGeometry(0.019, 20, 14), trim, [0, top + r * 0.99, 0]);
    topBtn.scale.set(1, 0.45, 1);

    // 6 Panel dividing seams & embroidered ventilation eyelets
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const pts: T.Vector3[] = [];
      for (let s = 0; s <= 14; s++) {
        const phi = (s / 14) * (Math.PI * 0.52);
        pts.push(new T.Vector3(
          Math.sin(ang) * Math.sin(phi) * (r + 0.0035),
          top + Math.cos(phi) * (r + 0.0035),
          Math.cos(ang) * Math.sin(phi) * (r + 0.0035)
        ));
      }
      seam(g, pts, stitch, 0.0038);

      // Embroidered ventilation eyelet
      const eyePhi = Math.PI * 0.28;
      const eyeAng = ang + Math.PI / 6;
      const ex = Math.sin(eyeAng) * Math.sin(eyePhi) * (r + 0.0035);
      const ey = top + Math.cos(eyePhi) * (r + 0.0035);
      const ez = Math.cos(eyeAng) * Math.sin(eyePhi) * (r + 0.0035);
      const eyelet = add(g, new T.TorusGeometry(0.009, 0.0032, 8, 18), stitch, [ex, ey, ez]);
      eyelet.lookAt(new T.Vector3(ex * 2, ey * 2, ez * 2));
    }

    // Curved visor with authentic downward arch and edge piping
    const visorCurvePts: T.Vector3[] = [
      new T.Vector3(-0.165, top - 0.015, 0.12),
      new T.Vector3(-0.125, top - 0.038, 0.265),
      new T.Vector3(0, top - 0.050, 0.33),
      new T.Vector3(0.125, top - 0.038, 0.265),
      new T.Vector3(0.165, top - 0.015, 0.12),
    ];
    seam(g, visorCurvePts, trim, 0.0085);

    // Visor with contrasting vintage green underbrim
    const brimGeo = new T.SphereGeometry(1, 44, 22, 0, Math.PI, 0, Math.PI * 0.42);
    const brim = add(g, brimGeo, fabric, [0, top - 0.012, 0.165], [0.12, 0, 0]);
    brim.scale.set(0.245, 0.025, 0.235);

    const underbrimMat = new T.MeshStandardMaterial({
      color: '#2d5a3c', // Classic retro green underbrim
      roughness: 0.82,
      side: T.BackSide,
    });
    const underbrim = add(g, brimGeo, underbrimMat, [0, top - 0.014, 0.165], [0.12, 0, 0]);
    underbrim.scale.set(0.242, 0.024, 0.232);

    // 4 Visor concentric stitch tracks
    for (const radiusOffset of [0.19, 0.22, 0.25, 0.28]) {
      const arcPts: T.Vector3[] = [];
      for (let j = 0; j <= 18; j++) {
        const th = (j / 18) * Math.PI;
        arcPts.push(new T.Vector3(
          Math.cos(th) * 0.135,
          top - 0.033 - Math.sin(th) * 0.016,
          0.165 + Math.sin(th) * radiusOffset * 0.6
        ));
      }
      seam(g, arcPts, stitch, 0.0028);
    }

    // Rear adjustable strap with antique brass metal slider buckle
    add(g, new T.BoxGeometry(0.12, 0.022, 0.006), fabric, [0, top - 0.01, -r * 0.98]);
    add(g, new T.BoxGeometry(0.025, 0.026, 0.01), brass, [0, top - 0.01, -r * 0.985]);

    // Front 3D embroidered brand patch
    brandPatch(g, logo, top + 0.078, 0.22, 0.21, 0.22, 0.065, 0.016);
  }

  // =========================================================
  // TOPS: HOODIE, TEE, SHIRT, SWEATSHIRT
  // =========================================================
  else {
    const isHoodie = kind === 'hoodie';
    const isShirt = kind === 'shirt';
    const isTee = kind === 'tee';
    const isSweatshirt = kind === 'sweatshirt';
    const isJacket = kind === 'jacket';

    const a = d.chest + ease;
    const b = d.chest * 0.72 + ease;
    const hem = d.hipY - 0.09;
    const shoulder = d.shoulder + ease;
    const waist = d.waist + ease + 0.018;

    // Organic cascading drape rings from hem to neck
    const torsoRings: Ring[] = [
      [hem, d.hips + ease * 0.84, d.hips * 0.69 + ease * 0.84, 0, 0],
      [hem + 0.07, d.hips + ease * 0.96, d.hips * 0.72 + ease * 0.96, 0, 0.012],
      [hem + 0.17, d.hips + ease * 1.06, d.hips * 0.74 + ease * 1.06, 0, 0.018],
      [d.waistY - 0.07, waist * 0.97, waist * 0.68, 0, 0.012],
      [d.waistY + 0.09, waist * 1.02, waist * 0.71, 0, 0.006],
      [d.chestY - 0.04, a * 0.98, b * 0.96, 0, 0.022],
      [d.chestY + 0.11, a * 1.03, b * 1.03, 0, 0.028],
      [d.shoulderY - 0.09, shoulder * 1.01, b * 0.84, 0, 0.012],
      [d.shoulderY, 0.20, 0.15, 0, 0],
    ];

    add(g, shell(torsoRings, 60, isTee ? 0.008 : 0.013), fabric);

    // Ribbed Hem Band on Bottom (Hoodie, Sweatshirt) or Hem Fold (Tee, Shirt)
    if (isHoodie || isSweatshirt) {
      const ribHeight = 0.088;
      const hemRings: Ring[] = [
        [hem - 0.015, d.hips + ease * 0.81, d.hips * 0.67 + ease * 0.81],
        [hem + ribHeight, d.hips + ease * 0.83, d.hips * 0.68 + ease * 0.83],
      ];
      add(g, shell(hemRings, 60, 0), trim);
      seam(g, [
        new T.Vector3(-a * 0.92, hem + ribHeight, 0),
        new T.Vector3(0, hem + ribHeight, b * 0.76),
        new T.Vector3(a * 0.92, hem + ribHeight, 0),
      ], stitch, 0.0045);
    } else if (isTee) {
      // Blind double-needle stitch at the bottom hem
      const hemStitch = add(g, new T.TorusGeometry(d.hips + ease * 0.86, 0.004, 8, 52), stitch, [0, hem + 0.02, 0]);
      hemStitch.rotation.x = Math.PI / 2;
      hemStitch.scale.y = 0.72;
    }

    // Arms & Sleeves
    for (const side of [-1, 1]) {
      const shPt = new T.Vector3(side * (shoulder - 0.02), d.shoulderY - 0.09, 0);

      if (isTee) {
        // Drop-shoulder boxy short sleeve
        const sleeveEnd = new T.Vector3(side * (shoulder + 0.138), d.chestY - 0.14, 0.03);
        const elbowMid = shPt.clone().lerp(sleeveEnd, 0.5);
        elbowMid.y += 0.01;

        curvedLimb(g, shPt, elbowMid, sleeveEnd, 0.160 * d.fullness + ease, 0.145 * d.fullness + ease, 0.135 * d.fullness + ease, fabric, 0.005);

        // Folded short sleeve cuff with stitch
        const cuffRing = add(g, new T.TorusGeometry(0.138 * d.fullness + ease, 0.006, 8, 30), trim, [sleeveEnd.x, sleeveEnd.y, sleeveEnd.z]);
        cuffRing.lookAt(elbowMid);
      } else {
        // Long sleeves (Hoodie, Sweatshirt, Shirt)
        const elbowPt = new T.Vector3(side * (shoulder + 0.175), d.waistY + 0.07, 0.04);
        const wristPt = new T.Vector3(side * (shoulder + 0.245), hem + 0.04, 0.06);

        curvedLimb(g, shPt, elbowPt, wristPt, 0.158 * d.fullness + ease, 0.128 * d.fullness + ease, 0.089 * d.fullness + ease, fabric, 0.007);

        if (isHoodie || isSweatshirt) {
          // Thick ribbed wrist cuff
          const cuffEnd = wristPt.clone().add(wristPt.clone().sub(elbowPt).normalize().multiplyScalar(0.075));
          curvedLimb(g, wristPt, wristPt.clone().lerp(cuffEnd, 0.5), cuffEnd, 0.089 * d.fullness + ease, 0.083 * d.fullness + ease, 0.077 * d.fullness + ease, trim, 0);
        } else if (isShirt) {
          // Structured shirt barrel cuff with pearl button
          const cuffEnd = wristPt.clone().add(wristPt.clone().sub(elbowPt).normalize().multiplyScalar(0.065));
          curvedLimb(g, wristPt, wristPt.clone().lerp(cuffEnd, 0.5), cuffEnd, 0.091 * d.fullness + ease, 0.091 * d.fullness + ease, 0.089 * d.fullness + ease, fabric, 0);
          add(g, new T.SphereGeometry(0.009, 14, 10), pearl, [wristPt.x + side * 0.04, wristPt.y, wristPt.z + 0.02]);
        }
      }

      // Side body stitch lines
      seam(g, [
        new T.Vector3(side * (a * 0.98), d.chestY + 0.08, -0.05),
        new T.Vector3(side * (waist * 0.98), d.waistY, -0.01),
        new T.Vector3(side * (d.hips * 0.98 + ease), hem, 0),
      ], stitch, 0.0042);
    }

    // ---------------------------------------------------------
    // SPECIFIC TOPS FEATURES
    // ---------------------------------------------------------
    // 1. HOODIE
    if (isHoodie) {
      // Dimensional Kangaroo Pocket with real depth and welt openings
      const pocketPouchRings: Ring[] = [
        [hem + 0.08, (waist * 1.05) * 0.73, 0.022, 0, b * 0.98 + 0.038],
        [hem + 0.18, (waist * 1.05) * 0.69, 0.024, 0, b * 0.99 + 0.042],
        [d.waistY + 0.06, (waist * 1.05) * 0.53, 0.020, 0, waist * 0.70 + 0.034],
      ];
      add(g, shell(pocketPouchRings, 36, 0.004), fabric);

      // Angled welt hand openings with bar-tack stitches
      for (const side of [-1, 1]) {
        seam(g, [
          new T.Vector3(side * (waist * 0.73), hem + 0.08, b * 0.98 + 0.038),
          new T.Vector3(side * (waist * 0.53), d.waistY + 0.06, waist * 0.70 + 0.034),
        ], trim, 0.0075);
      }
      seam(g, [
        new T.Vector3(-waist * 0.53, d.waistY + 0.06, waist * 0.70 + 0.034),
        new T.Vector3(waist * 0.53, d.waistY + 0.06, waist * 0.70 + 0.034),
      ], stitch, 0.0052);

      // Double-walled realistic 3D Hood (outer shell + interior lining)
      const hood = add(g, new T.SphereGeometry(0.315, 52, 36, 0, Math.PI * 2, 0.92, Math.PI - 0.92), fabric, [0, d.shoulderY + 0.28, -0.04]);
      hood.rotation.x = Math.PI / 2;
      hood.scale.set(1.02, 1.05, 1.25);

      // Inner hood lining shell
      const innerHood = add(g, new T.SphereGeometry(0.308, 44, 28, 0, Math.PI * 2, 0.94, Math.PI - 0.94), lining, [0, d.shoulderY + 0.28, -0.04]);
      innerHood.rotation.x = Math.PI / 2;
      innerHood.scale.set(1.01, 1.04, 1.23);

      // Central ridge seam along the top and back of the hood
      const hoodCenterPts: T.Vector3[] = [];
      for (let k = 0; k <= 18; k++) {
        const ang = (k / 18) * Math.PI;
        hoodCenterPts.push(new T.Vector3(
          0,
          d.shoulderY + 0.28 + Math.sin(ang) * 0.325,
          -0.04 - Math.cos(ang) * 0.365
        ));
      }
      seam(g, hoodCenterPts, stitch, 0.0048);

      // Tubular face opening hem
      const hoodRim = add(g, new T.TorusGeometry(0.245, 0.017, 14, 52), trim, [0, d.shoulderY + 0.34, 0.145]);
      hoodRim.scale.set(0.95, 1.28, 1);

      // Chrome drawcord grommets at neck base
      for (const x of [-0.07, 0.07]) {
        add(g, new T.TorusGeometry(0.015, 0.0048, 8, 18), chrome, [x, d.shoulderY + 0.05, 0.19], [Math.PI / 2, 0, 0]);
      }

      // Hanging braided drawstrings with natural gravity and chrome aglets
      for (const side of [-1, 1]) {
        const cordPts = [
          new T.Vector3(side * 0.07, d.shoulderY + 0.05, 0.19),
          new T.Vector3(side * 0.082, d.chestY + 0.04, b + 0.036),
          new T.Vector3(side * 0.062, d.chestY - 0.12, b + 0.039),
          new T.Vector3(side * 0.092, d.waistY + 0.06, waist * 0.71 + 0.042),
        ];
        seam(g, cordPts, trim, 0.0062);

        // Polished metal aglets with engraved detail
        const endPt = cordPts[cordPts.length - 1];
        add(g, new T.CylinderGeometry(0.0072, 0.0072, 0.038, 18), chrome, [endPt.x, endPt.y - 0.019, endPt.z]);
      }
    }

    // 2. CREW COLLAR (Tee, Sweatshirt)
    if (isTee || isSweatshirt) {
      const collarR = isSweatshirt ? 0.178 : 0.170;
      const collarThickness = isSweatshirt ? 0.033 : 0.025;
      const collar = add(g, new T.TorusGeometry(collarR, collarThickness, 14, 52), trim, [0, d.shoulderY + 0.01, 0.02]);
      collar.rotation.x = Math.PI / 2 + 0.12;
      collar.scale.set(1.05, 0.88, 1);

      // Internal herringbone neck tape from shoulder to shoulder
      const neckTapePts = [
        new T.Vector3(-shoulder * 0.45, d.shoulderY + 0.01, -0.06),
        new T.Vector3(0, d.shoulderY + 0.03, -0.10),
        new T.Vector3(shoulder * 0.45, d.shoulderY + 0.01, -0.06),
      ];
      seam(g, neckTapePts, trim, 0.006);

      // Sweatshirt Iconic V-Notch Insert at front collar
      if (isSweatshirt) {
        const vPts = [
          new T.Vector3(-0.062, d.shoulderY - 0.01, b * 0.88),
          new T.Vector3(0, d.shoulderY - 0.095, b * 0.94),
          new T.Vector3(0.062, d.shoulderY - 0.01, b * 0.88),
        ];
        seam(g, vPts, stitch, 0.0048);

        // Ribbed side expansion gussets under armpits
        for (const side of [-1, 1]) {
          const gusset = add(g, new T.BoxGeometry(0.015, 0.32, 0.08), trim, [side * (a * 0.99), d.waistY + 0.05, 0]);
          gusset.rotation.y = side * 0.05;
        }
      }
    }

    // 3. SHIRT (Contemporary Utility Overshirt)
    if (isShirt) {
      // Structured 2-piece collar: neck stand + folded lapel wings
      const stand = add(g, new T.CylinderGeometry(0.145, 0.16, 0.07, 36, 1, true), trim, [0, d.shoulderY + 0.05, 0.01]);
      stand.rotation.x = -0.05;

      // Folded collar wings with sharp points
      for (const side of [-1, 1]) {
        const wingPts = [
          new T.Vector3(0, d.shoulderY + 0.07, 0.16),
          new T.Vector3(side * 0.15, d.shoulderY + 0.05, 0.12),
          new T.Vector3(side * 0.175, d.shoulderY - 0.045, 0.205),
          new T.Vector3(side * 0.03, d.shoulderY - 0.02, 0.215),
          new T.Vector3(0, d.shoulderY + 0.07, 0.16),
        ];
        seam(g, wingPts, trim, 0.0085);
      }

      // Front vertical placket strip
      const placketLength = (d.shoulderY + 0.02) - hem;
      const placket = add(g, new T.BoxGeometry(0.046, placketLength, 0.012), trim, [0, hem + placketLength * 0.5, b + 0.012]);
      placket.scale.set(1, 1, 1);

      // Pearlescent buttons with cross thread details
      const numButtons = 6;
      for (let i = 0; i < numButtons; i++) {
        const by = hem + 0.10 + i * (placketLength - 0.15) / (numButtons - 1);
        const bz = b + (by > d.waistY ? 0.023 : 0.016);
        add(g, new T.CylinderGeometry(0.011, 0.011, 0.006, 20), pearl, [0, by, bz], [Math.PI / 2, 0, 0]);
      }

      // Dual Symmetrical Chest Flap Pockets (Contemporary Overshirt Style)
      for (const side of [-1, 1]) {
        const pockX = side * 0.145;
        const pockY = d.chestY + 0.02;
        const pockZ = b + 0.019;
        const pockW = 0.135;
        const pockH = 0.155;

        // Pocket body outline
        seam(g, [
          new T.Vector3(pockX - side * (pockW * 0.5), pockY + pockH * 0.5, pockZ),
          new T.Vector3(pockX + side * (pockW * 0.5), pockY + pockH * 0.5, pockZ),
          new T.Vector3(pockX + side * (pockW * 0.5), pockY - pockH * 0.35, pockZ),
          new T.Vector3(pockX, pockY - pockH * 0.5, pockZ),
          new T.Vector3(pockX - side * (pockW * 0.5), pockY - pockH * 0.35, pockZ),
          new T.Vector3(pockX - side * (pockW * 0.5), pockY + pockH * 0.5, pockZ),
        ], stitch, 0.0042);

        // Pocket top buttoned flap
        const flapPts = [
          new T.Vector3(pockX - side * (pockW * 0.52), pockY + pockH * 0.52, pockZ + 0.005),
          new T.Vector3(pockX + side * (pockW * 0.52), pockY + pockH * 0.52, pockZ + 0.005),
          new T.Vector3(pockX + side * (pockW * 0.48), pockY + pockH * 0.22, pockZ + 0.006),
          new T.Vector3(pockX, pockY + pockH * 0.10, pockZ + 0.007),
          new T.Vector3(pockX - side * (pockW * 0.48), pockY + pockH * 0.22, pockZ + 0.006),
          new T.Vector3(pockX - side * (pockW * 0.52), pockY + pockH * 0.52, pockZ + 0.005),
        ];
        seam(g, flapPts, trim, 0.0055);
        add(g, new T.CylinderGeometry(0.008, 0.008, 0.005, 16), pearl, [pockX, pockY + pockH * 0.26, pockZ + 0.010], [Math.PI / 2, 0, 0]);
      }

      // Back yoke seam with central box pleat (pliegue de caja en la espalda)
      seam(g, [
        new T.Vector3(-shoulder * 0.88, d.shoulderY - 0.10, -b * 0.82),
        new T.Vector3(0, d.shoulderY - 0.08, -b * 0.86),
        new T.Vector3(shoulder * 0.88, d.shoulderY - 0.10, -b * 0.82),
      ], stitch, 0.0045);

      // Inverted box pleat vertical seam
      seam(g, [
        new T.Vector3(0, d.shoulderY - 0.08, -b * 0.86),
        new T.Vector3(0, d.waistY + 0.05, -b * 0.72),
      ], stitch, 0.004);
    }

    // 4. JACKET (Contemporary Technical Windbreaker / Deployment Jacket)
    if (isJacket) {
      // Structured stand collar
      const stand = add(g, new T.CylinderGeometry(0.145, 0.165, 0.08, 36, 1, true), trim, [0, d.shoulderY + 0.05, 0.01]);
      stand.rotation.x = -0.04;

      // Full-length front zipper track
      const zipLength = (d.shoulderY + 0.06) - hem;
      add(g, new T.BoxGeometry(0.014, zipLength, 0.008), chrome, [0, hem + zipLength * 0.5, b + 0.014]);

      // Metallic zipper slider and pull tab
      const sliderY = hem + zipLength * 0.72;
      add(g, new T.BoxGeometry(0.022, 0.035, 0.016), chrome, [0, sliderY, b + 0.02]);
      add(g, new T.BoxGeometry(0.014, 0.045, 0.005), chrome, [0, sliderY - 0.03, b + 0.024]);

      // Welts on angled waist pockets
      for (const side of [-1, 1]) {
        const weltX = side * (a * 0.55);
        const weltY = hem + 0.16;
        const weltZ = b * 0.88;
        const welt = add(g, new T.BoxGeometry(0.14, 0.022, 0.012), trim, [weltX, weltY, weltZ]);
        welt.rotation.z = side * -0.42;
      }
    }

    // High resolution Brand Placement
    const patchWidth = (isShirt || isJacket) ? 0.24 : Math.min(0.66, a * 1.7);
    const patchHeight = (isShirt || isJacket) ? 0.075 : patchWidth * 0.287;
    const patchX = isJacket ? -a * 0.45 : 0;
    brandPatch(g, logo, d.chestY - 0.05, a, b, patchWidth, patchHeight, 0.014, patchX);

    // Inner back neck woven label
    const neckLabel = new T.Group();
    brandPatch(neckLabel, logo, 0, 0.20, 0.01, 0.16, 0.046);
    neckLabel.rotation.y = Math.PI;
    neckLabel.position.set(0, d.shoulderY - 0.18, -b * 0.88);
    g.add(neckLabel);
  }

  g.name = `RIWI ${kind}`;
  return g;
}

export function categoryKind(category: string): GarmentKind {
  return (
    {
      hoodies: 'hoodie',
      camisetas: 'tee',
      camisas: 'shirt',
      jeans: 'jeans',
      buzos: 'sweatshirt',
      sudaderas: 'joggers',
      accesorios: 'cap',
      chaquetas: 'jacket',
    } as Record<string, GarmentKind>
  )[category] ?? 'tee';
}
