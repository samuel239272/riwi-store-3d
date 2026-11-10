import { useEffect, useRef, type ComponentRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import type { CameraCommand } from '../types/viewer';

export function CameraController({
  command,
  reducedMotion,
  interior,
  autoRotate = false,
}: {
  command: CameraCommand;
  reducedMotion: boolean;
  interior: boolean;
  autoRotate?: boolean;
}) {
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const destination = useRef<{ position: Vector3; target: Vector3 } | null>(null);
  const { camera, invalidate, gl } = useThree();
  useEffect(() => {
    if (!controls.current) return;
    // Drain orbit inertia before a preset/reset so an old drag cannot move the new camera.
    controls.current.enableDamping = false;
    controls.current.update();
    controls.current.enableDamping = !reducedMotion;
    const target = command.target
      ? new Vector3(...command.target)
      : controls.current.target.clone();
    let position = command.position ? new Vector3(...command.position) : camera.position.clone();
    if (command.zoom) {
      const offset = camera.position.clone().sub(target);
      offset.setLength(Math.min(8, Math.max(2, offset.length() * command.zoom)));
      position = target.clone().add(offset);
    }
    if (reducedMotion) {
      destination.current = null;
      camera.position.copy(position);
      controls.current.target.copy(target);
      controls.current.update();
    } else destination.current = { position, target };
    invalidate();
  }, [command, camera, invalidate, reducedMotion]);
  useFrame((_, delta) => {
    gl.domElement.dataset.cameraPosition = camera.position
      .toArray()
      .map((value) => value.toFixed(3))
      .join(',');
    if (controls.current) {
      gl.domElement.dataset.cameraTarget = controls.current.target
        .toArray()
        .map((value) => value.toFixed(3))
        .join(',');
      gl.domElement.dataset.cameraDistance = camera.position
        .distanceTo(controls.current.target)
        .toFixed(3);
    }
    if (!destination.current || !controls.current) return;
    const { position, target } = destination.current;
    const alpha = 1 - Math.exp(-8 * Math.min(delta, 0.05));
    camera.position.lerp(position, alpha);
    controls.current.target.lerp(target, alpha);
    controls.current.update();
    if (
      camera.position.distanceTo(position) < 0.002 &&
      controls.current.target.distanceTo(target) < 0.002
    ) {
      camera.position.copy(position);
      controls.current.target.copy(target);
      controls.current.update();
      destination.current = null;
      invalidate();
    } else invalidate();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      autoRotate={autoRotate}
      autoRotateSpeed={0.7}
      enableDamping={!reducedMotion}
      dampingFactor={0.09}
      enablePan={false}
      minDistance={2}
      maxDistance={8}
      minPolarAngle={0.02}
      maxPolarAngle={interior ? Math.PI - 0.02 : Math.PI * 0.62}
      rotateSpeed={0.65}
      zoomSpeed={0.8}
      target={[0, 0.12, 0]}
      onStart={() => {
        destination.current = null;
      }}
    />
  );
}
