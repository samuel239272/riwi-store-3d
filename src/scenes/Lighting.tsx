import { Environment, Lightformer, ContactShadows } from '@react-three/drei';

export function Lighting({ mode = 'studio' }: { mode?: 'studio' | 'soft' }) {
  const soft = mode === 'soft';
  return (
    <>
      <ambientLight intensity={soft ? 0.95 : 0.65} />
      <directionalLight position={[-3.5, 6, 5]} intensity={soft ? 1.8 : 2.6} color="#fff7f3" />
      <directionalLight position={[4, 2.5, -3]} intensity={soft ? 0.35 : 1.15} color="#ef7a88" />
      <directionalLight position={[0, 4, -5]} intensity={soft ? 0.8 : 1.35} color="#e6e8ff" />
      <directionalLight position={[2, -1, 3]} intensity={0.25} color="#e9e7ef" />
      <Environment resolution={128} frames={1}>
        <Lightformer
          form="rect"
          intensity={2.2}
          position={[0, 5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[10, 10, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.6}
          position={[-4, 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
          scale={[3, 5, 1]}
        />
        <Lightformer form="ring" intensity={1.8} position={[0, 2, -4]} scale={[4, 4, 1]} />
      </Environment>
      <ContactShadows
        position={[0, -1.48, 0]}
        opacity={0.5}
        scale={7}
        blur={2.4}
        far={4}
        resolution={256}
        frames={1}
        color="#070609"
      />
    </>
  );
}
