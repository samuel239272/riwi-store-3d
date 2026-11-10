import { Box3, Mesh, type Object3D, type Material, type Texture } from 'three';
export function validateModel(scene: Object3D) {
  const bounds = new Box3().setFromObject(scene);
  if (
    bounds.isEmpty() ||
    ![...bounds.min.toArray(), ...bounds.max.toArray()].every(Number.isFinite)
  )
    throw new Error('El modelo no contiene geometría válida.');
}
export function disposeModel(scene: Object3D) {
  const materials = new Set<Material>();
  const textures = new Set<Texture>();
  scene.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    (Array.isArray(object.material) ? object.material : [object.material]).forEach((material) =>
      materials.add(material),
    );
  });
  materials.forEach((material) => {
    Object.values(material).forEach((value: unknown) => {
      if (value && typeof value === 'object' && 'isTexture' in value)
        textures.add(value as Texture);
    });
    material.dispose();
  });
  textures.forEach((texture) => texture.dispose());
}
