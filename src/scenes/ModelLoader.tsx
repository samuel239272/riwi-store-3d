import { useEffect, useLayoutEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Mesh, MeshStandardMaterial, Vector2 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import type { Group } from 'three';
import { disposeModel, validateModel } from '../utils/modelHelpers';
import { assetUrl } from '../utils/assets';
import { getFabricTextures } from '../three/textures';
import { smoothFabricNormals } from '../utils/fabricNormals';
import type { ThreeEvent } from '@react-three/fiber';
import type { Vector3Tuple } from '../types/product';
import { attachGarmentHologram, type GarmentHologram } from '../three/garmentHologram';

export type ModelStatus = { state: 'loading' | 'ready' | 'error'; progress: number };
export function ModelLoader({
  url,
  scale = 1,
  color,
  onStatus,
  onFocus,
  hologram,
}: {
  url: string;
  scale?: number;
  color?: string;
  onStatus: (status: ModelStatus) => void;
  onFocus: (point: Vector3Tuple) => void;
  hologram?: GarmentHologram;
}) {
  const [model, setModel] = useState<Group | null>(null);
  const { invalidate, gl } = useThree();
  const hologramActive = Boolean(hologram?.active);
  const revealProgress = hologram?.progress;
  useLayoutEffect(() => {
    const canvas = gl.domElement;
    if (!model || !revealProgress || !hologramActive) {
      canvas.dataset.hologramProgress = '1';
      return;
    }
    const effect = attachGarmentHologram(model);
    const update = (value: number) => {
      effect.setProgress(value);
      canvas.dataset.hologramProgress = Math.max(0, Math.min(1, value)).toFixed(4);
      invalidate();
    };
    update(revealProgress.get());
    const unsubscribe = revealProgress.on('change', update);
    return () => {
      unsubscribe();
      effect.dispose();
      invalidate();
    };
  }, [model, revealProgress, hologramActive, scale, gl, invalidate]);
  useEffect(() => {
    if (!model) return;
    const isJeans = url.includes('jeans');
    const isCap = url.includes('cap');
    const pattern = isJeans ? 'denim' : isCap ? 'canvas' : 'cotton';
    const bundle = getFabricTextures(pattern, isJeans ? 28 : 22);

    model.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      if (materials.every((material) => material.name === 'fabric'))
        smoothFabricNormals(object.geometry);
      materials.forEach((material) => {
        if (material instanceof MeshStandardMaterial && material.name === 'fabric') {
          if (color) material.color.set(color);
          if (bundle) {
            if (!material.normalMap) material.normalMap = bundle.normalMap;
            if (!material.roughnessMap) material.roughnessMap = bundle.roughnessMap;
            if (!material.map) material.map = bundle.diffuseMap;
            material.normalScale = new Vector2(0.42, 0.42);
          }
          material.roughness = isJeans ? 0.88 : 0.8;
          material.metalness = 0.02;
          material.needsUpdate = true;
        }
      });
    });
    invalidate();
  }, [model, color, url, invalidate]);
  useEffect(() => {
    let active = true;
    let loaded: Group | undefined;
    const draco = new DRACOLoader().setDecoderPath(assetUrl('/decoders/draco/'));
    const loader = new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);
    onStatus({ state: 'loading', progress: 0 });
    loader.load(
      url,
      (gltf) => {
        if (!active) {
          disposeModel(gltf.scene);
          return;
        }
        loaded = gltf.scene;
        try {
          validateModel(loaded);
          setModel(loaded);
          onStatus({ state: 'ready', progress: 100 });
        } catch {
          disposeModel(loaded);
          loaded = undefined;
          onStatus({ state: 'error', progress: 0 });
        }
      },
      (event) => {
        if (active)
          onStatus({
            state: 'loading',
            progress: event.total ? Math.round((event.loaded / event.total) * 100) : 0,
          });
      },
      () => {
        if (active) onStatus({ state: 'error', progress: 0 });
      },
    );
    return () => {
      active = false;
      draco.dispose();
      if (loaded) disposeModel(loaded);
    };
  }, [url, onStatus]);
  if (!model) return null;
  return (
    <primitive
      object={model}
      scale={scale}
      dispose={null}
      onDoubleClick={(event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        onFocus(event.point.toArray());
      }}
    />
  );
}
