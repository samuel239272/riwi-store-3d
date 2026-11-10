import { Component, useCallback, useLayoutEffect, useState, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import { ACESFilmicToneMapping } from 'three';
import { Lighting } from './Lighting';
import { ModelLoader, type ModelStatus } from './ModelLoader';
import { CameraController } from './CameraController';
import { Hotspots } from '../components/hotspots/Hotspots';
import { CAMERA_PRESETS, type CameraCommand } from '../types/viewer';
import type { Product, Vector3Tuple } from '../types/product';
import type { GarmentHologram } from '../three/garmentHologram';

class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Remove the listener before Fiber deliberately loses the old context on disposal.
function ContextGuard({ onStatus }: { onStatus: (status: ModelStatus) => void }) {
  const { gl } = useThree();
  useLayoutEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onStatus({ state: 'error', progress: 0 });
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onStatus]);
  return null;
}

export default function ProductScene({
  product,
  color,
  command,
  visible,
  showHotspots,
  selectedId,
  reducedMotion,
  autoRotate,
  lighting,
  onSelect,
  onStatus,
  onFocus,
  hologram,
}: {
  product: Product;
  color?: string;
  command: CameraCommand;
  visible: boolean;
  showHotspots: boolean;
  selectedId?: string;
  reducedMotion: boolean;
  autoRotate: boolean;
  lighting: 'studio' | 'soft';
  onSelect: (id: string) => void;
  onStatus: (status: ModelStatus) => void;
  onFocus: (point: Vector3Tuple) => void;
  hologram?: GarmentHologram;
}) {
  const [modelReady, setModelReady] = useState(false);
  const handleStatus = useCallback(
    (status: ModelStatus) => {
      setModelReady(status.state === 'ready');
      onStatus(status);
    },
    [onStatus],
  );
  return (
    <SceneBoundary onError={() => onStatus({ state: 'error', progress: 0 })}>
      <Canvas
        aria-label={`Modelo 3D de ${product.name}`}
        frameloop={visible ? (autoRotate && !reducedMotion ? 'always' : 'demand') : 'never'}
        dpr={[1, window.innerWidth < 768 ? 1.25 : 1.5]}
        camera={{ position: CAMERA_PRESETS.perspective, fov: 35, near: 0.1, far: 50 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
      >
        <ContextGuard onStatus={onStatus} />
        <Lighting key={`${modelReady}-${lighting}`} mode={lighting} />
        {product.model3D && (
          <ModelLoader
            url={product.model3D.exterior}
            scale={product.model3D.scale}
            color={color}
            onStatus={handleStatus}
            onFocus={onFocus}
            hologram={hologram}
          />
        )}
        <CameraController
          command={command}
          reducedMotion={reducedMotion}
          interior={false}
          autoRotate={autoRotate && !reducedMotion && visible}
        />
        {showHotspots && (
          <group scale={product.model3D?.scale ?? 1}>
            <Hotspots components={product.components} selectedId={selectedId} onSelect={onSelect} />
          </group>
        )}
        <AdaptiveDpr pixelated />
      </Canvas>
    </SceneBoundary>
  );
}
