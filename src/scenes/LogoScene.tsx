import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ExtrudeGeometry, Shape, Plane, Vector3, Group, MathUtils } from 'three';
import artwork from '../data/riwiContours.json';

function Sculpture({ paused, reduced, rotation }: { paused: boolean; reduced: boolean; rotation: number }) {
  const group = useRef<Group>(null);
  const elapsed = useRef(0);
  const plane = useMemo(() => new Plane(new Vector3(-1, 0, 0), 5), []);
  const { gl, invalidate, viewport } = useThree();
  const scale = Math.min(1, viewport.width / 9.4);
  const shapes = useMemo(() => artwork.contours.map(contour => {
    const shape = new Shape();
    contour.points.forEach(([x,y],i) => { const p = [(x / artwork.width - .5) * 7.8, (.5 - y / artwork.height) * (7.8 * artwork.height / artwork.width)]; if (i) shape.lineTo(p[0],p[1]); else shape.moveTo(p[0],p[1]); });
    const geometry = new ExtrudeGeometry(shape, { depth: .3, bevelEnabled: true, bevelThickness: .045, bevelSize: .018, bevelSegments: 3, curveSegments: 12 });
    geometry.translate(0, 0, -.15);
    const x = contour.points.reduce((sum,p)=>sum+p[0],0)/contour.points.length/artwork.width;
    return { geometry, color: contour.color, fixed: x < .29 || x > .86 };
  }), []);
  useEffect(() => { invalidate(); }, [paused, reduced, rotation, invalidate]);
  useEffect(() => () => shapes.forEach(s => s.geometry.dispose()), [shapes]);
  useFrame((state,delta) => {
    if (!paused && !reduced) elapsed.current += Math.min(delta,.05);
    const cycle = elapsed.current % 12;
    const progress = reduced ? 1 : cycle < 1 ? 1 : cycle < 4.2 ? 1 - (cycle - 1)/3.2 : cycle < 5 ? 0 : cycle < 8.5 ? (cycle - 5)/3.5 : 1;
    plane.constant = MathUtils.lerp(-2,3.5,progress) * scale;
    if (group.current) {
      group.current.rotation.y = MathUtils.lerp(group.current.rotation.y, rotation + (reduced ? 0 : state.pointer.x * .16), reduced || paused ? 1 : .055);
      group.current.rotation.x = MathUtils.lerp(group.current.rotation.x, reduced ? 0 : -state.pointer.y * .09, .055);
      group.current.position.y = reduced ? 0 : Math.sin(elapsed.current * .6) * .06;
    }
    gl.domElement.dataset.logoProgress = progress.toFixed(3);
    gl.domElement.dataset.logoState = reduced ? 'reduced' : paused ? 'paused' : 'animated';
  });
  return <group ref={group} scale={scale} rotation={[-.04, .08, 0]}>{shapes.map((s,i)=><mesh key={i} geometry={s.geometry}>
    <meshPhysicalMaterial color={s.color} metalness={.32} roughness={.22} clearcoat={1} clearcoatRoughness={.16} emissive={s.color} emissiveIntensity={.2} clippingPlanes={s.fixed ? [] : [plane]} side={2} />
  </mesh>)}</group>;
}
export default function LogoScene(props: { visible: boolean; paused: boolean; reduced: boolean; rotation: number }) {
  return <Canvas dpr={[1,1.5]} frameloop={props.visible ? props.reduced || props.paused ? 'demand' : 'always' : 'never'} camera={{ position: [0, .15, 13.6], fov: 40 }} gl={{ antialias: true, alpha: true, localClippingEnabled: true }} aria-label="Logo oficial RIWI con volumen 3D">
    <ambientLight intensity={2} color="#cdd5ff" />
    <directionalLight position={[0,4,6]} intensity={6} color="#fff4ff" />
    <directionalLight position={[-5,0,3]} intensity={7} color="#a48aff" />
    <directionalLight position={[5,2,-2]} intensity={9} color="#bdf6ff" />
    <Sculpture {...props} />
    <OrbitControls enablePan={false} enableZoom={false} enableDamping={!props.reduced} minPolarAngle={Math.PI*.35} maxPolarAngle={Math.PI*.65} minAzimuthAngle={-.7} maxAzimuthAngle={.7} rotateSpeed={.6} />
  </Canvas>;
}
