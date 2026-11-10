import { BufferAttribute, type BufferGeometry, Vector3 } from 'three';

/** Smooth the cloth across duplicated UV vertices without welding seams or moving geometry. */
export function smoothFabricNormals(geometry: BufferGeometry) {
  if (geometry.userData.fabricNormalsSmoothed) return;
  const positions = geometry.getAttribute('position');
  if (!positions) return;
  const keys = Array.from(
    { length: positions.count },
    (_, index) =>
      `${Math.round(positions.getX(index) * 1e5)},${Math.round(positions.getY(index) * 1e5)},${Math.round(positions.getZ(index) * 1e5)}`,
  );
  const normals = new Map<string, Vector3>();
  const a = new Vector3(),
    b = new Vector3(),
    c = new Vector3(),
    ab = new Vector3(),
    ac = new Vector3();
  const indices = geometry.index;
  const count = indices?.count ?? positions.count;
  for (let face = 0; face < count; face += 3) {
    const ia = indices ? indices.getX(face) : face;
    const ib = indices ? indices.getX(face + 1) : face + 1;
    const ic = indices ? indices.getX(face + 2) : face + 2;
    a.fromBufferAttribute(positions, ia);
    b.fromBufferAttribute(positions, ib);
    c.fromBufferAttribute(positions, ic);
    ab.subVectors(b, a);
    ac.subVectors(c, a);
    ab.cross(ac);
    for (const index of [ia, ib, ic]) {
      const key = keys[index];
      const value = normals.get(key);
      if (value) value.add(ab);
      else normals.set(key, ab.clone());
    }
  }
  const result = new Float32Array(positions.count * 3);
  normals.forEach((normal) => normal.normalize());
  keys.forEach((key, index) => normals.get(key)?.toArray(result, index * 3));
  geometry.setAttribute('normal', new BufferAttribute(result, 3));
  geometry.userData.fabricNormalsSmoothed = true;
}
