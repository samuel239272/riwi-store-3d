import { Box3, MathUtils, Mesh, MeshStandardMaterial, Vector2, type Object3D } from 'three';
import type { MotionValue } from 'framer-motion';

export type GarmentHologram = { progress: MotionValue<number>; active: boolean };

/** One opt-in material pass. Original garment materials and geometry remain intact. */
export function attachGarmentHologram(model: Object3D) {
  model.updateWorldMatrix(true, true);
  const bounds = new Box3().setFromObject(model);
  const uniforms = {
    uRiwiReveal: { value: 0 },
    uRiwiBoundsY: { value: new Vector2(bounds.min.y, bounds.max.y) },
  };
  const restorations: Array<() => void> = [];
  const patched = new Set<MeshStandardMaterial>();

  model.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!(material instanceof MeshStandardMaterial) || patched.has(material)) continue;
      patched.add(material);
      const previousCompile = material.onBeforeCompile;
      const previousCacheKey = material.customProgramCacheKey;
      material.onBeforeCompile = (shader, renderer) => {
        previousCompile.call(material, shader, renderer);
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec3 vRiwiWorldPosition;')
          .replace(
            '#include <project_vertex>',
            '#include <project_vertex>\nvRiwiWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;',
          );
        shader.fragmentShader = shader.fragmentShader
          .replace(
            '#include <common>',
            `#include <common>
            uniform float uRiwiReveal;
            uniform vec2 uRiwiBoundsY;
            varying vec3 vRiwiWorldPosition;`,
          )
          .replace(
            '#include <clipping_planes_fragment>',
            `#include <clipping_planes_fragment>
            float riwiSpan = max(uRiwiBoundsY.y - uRiwiBoundsY.x, 0.0001);
            float riwiHeight = (vRiwiWorldPosition.y - uRiwiBoundsY.x) / riwiSpan;
            float riwiFrontier = mix(-0.035, 1.04, uRiwiReveal);
            if (riwiHeight > riwiFrontier) discard;`,
          )
          .replace(
            '#include <opaque_fragment>',
            `float riwiHologram = 1.0 - smoothstep(0.70, 1.0, uRiwiReveal);
            float riwiScan = pow(0.5 + 0.5 * sin(riwiHeight * 640.0), 12.0);
            float riwiFresnel = pow(1.0 - clamp(dot(normalize(normal), normalize(vViewPosition)), 0.0, 1.0), 1.8);
            float riwiBand = 1.0 - smoothstep(0.004, 0.032, abs(riwiHeight - riwiFrontier));
            vec3 riwiLight = mix(vec3(0.08, 0.92, 1.18), vec3(0.52, 0.20, 1.05), clamp(riwiHeight, 0.0, 1.0));
            vec3 riwiSurface = riwiLight * (0.26 + riwiFresnel * 0.58 + riwiScan * 0.26);
            outgoingLight = mix(outgoingLight, riwiSurface, riwiHologram * 0.82);
            outgoingLight += riwiLight * (riwiScan * 0.18 + riwiFresnel * 0.25) * riwiHologram;
            outgoingLight += vec3(0.12, 1.65, 2.05) * riwiBand;
            #include <opaque_fragment>`,
          );
      };
      material.customProgramCacheKey = () => `${previousCacheKey.call(material)}|riwi-hologram-v1`;
      material.needsUpdate = true;
      restorations.push(() => {
        material.onBeforeCompile = previousCompile;
        material.customProgramCacheKey = previousCacheKey;
        material.needsUpdate = true;
      });
    }
  });

  return {
    setProgress(value: number) {
      uniforms.uRiwiReveal.value = MathUtils.clamp(value, 0, 1);
    },
    dispose() {
      restorations.forEach((restore) => restore());
    },
  };
}
