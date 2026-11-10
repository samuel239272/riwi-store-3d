import { Component, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Box3, Group, Mesh } from 'three';
import { type BodyModel, type BodyProfile } from '../utils/bodyProfile';
import { assetUrl } from '../utils/assets';
import { CameraController } from './CameraController';
import {
  cloneFittingModel,
  coverBody,
  deformBody,
  deformGarment,
  disposeFittingModel,
  loadFittingModel,
  registerGarment,
} from '../three/fittingModels';
import type { Product, CategoryId } from '../types/product';
import type { CameraCommand } from '../types/viewer';

type Props = {
  product: Product;
  profile: BodyProfile;
  bodyModel: BodyModel;
  dressed: boolean;
  color: string;
  skin: string;
  fit: 'regular' | 'relaxed';
  command: CameraCommand;
  rotate: boolean;
  reduced: boolean;
  visible: boolean;
  onReady: () => void;
  onError: () => void;
};
class Boundary extends Component<
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
interface Outfit {
  identity: string;
  body: Group;
  clothes: { mesh: Group; category: CategoryId; selected: boolean }[];
}

function Avatar({
  profile,
  bodyModel,
  dressed,
  product,
  color,
  skin,
  fit,
  onReady,
  onError,
}: Props) {
  const { invalidate, gl } = useThree();
  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const identity = `${bodyModel}:${product.id}:${dressed}`;
  useEffect(() => {
    let active = true;
    let owned: Outfit | undefined;
    setOutfit(null);
    const bottom = product.category === 'jeans' || product.category === 'sudaderas';
    const garments: { url: string; category: CategoryId; selected: boolean }[] = dressed
      ? [
          { url: product.model3D!.exterior, category: product.category, selected: true },
          {
            url: assetUrl(`/models/optimized/${bottom ? 'tee' : 'joggers'}.glb`),
            category: bottom ? 'camisetas' : 'sudaderas',
            selected: false,
          },
          ...(product.category === 'accesorios'
            ? [
                {
                  url: assetUrl('/models/optimized/tee.glb'),
                  category: 'camisetas' as CategoryId,
                  selected: false,
                },
              ]
            : []),
        ]
      : [];
    Promise.all([
      loadFittingModel(assetUrl(`/models/bodies/${bodyModel}.glb`)),
      ...garments.map((g) => loadFittingModel(g.url)),
    ])
      .then(([bodySource, ...clothes]) => {
        if (!active) return;
        owned = {
          identity,
          body: cloneFittingModel(bodySource),
          clothes: clothes.map((source, i) => {
            const mesh = cloneFittingModel(source);
            registerGarment(mesh, garments[i].category, bodyModel);
            return { mesh, category: garments[i].category, selected: garments[i].selected };
          }),
        };
        if (dressed) coverBody(owned.body, product.category);
        setOutfit(owned);
      })
      .catch(() => {
        if (active) onError();
      });
    return () => {
      active = false;
      if (owned) {
        disposeFittingModel(owned.body);
        owned.clothes.forEach((g) => disposeFittingModel(g.mesh));
      }
    };
  }, [identity, bodyModel, dressed, product.id, product.category, product.model3D, onError]);

  useLayoutEffect(() => {
    if (!outfit || outfit.identity !== identity) return;
    deformBody(outfit.body, profile, bodyModel, skin);
    outfit.clothes.forEach((g) =>
      deformGarment(
        g.mesh,
        profile,
        bodyModel,
        g.selected ? color : '#292a38',
        fit === 'relaxed',
        g.category,
      ),
    );
    const bounds = new Box3().setFromObject(outfit.body);
    const countVertices = (group: Group) => {
      let count = 0;
      group.traverse((o) => {
        if (o instanceof Mesh) count += o.geometry.getAttribute('position').count;
      });
      return count;
    };
    Object.assign(gl.domElement.dataset, {
      bodyHeight: String(profile.height),
      bodyWaist: String(profile.waist),
      bodyModel,
      bodyMeshWidth: (bounds.max.x - bounds.min.x).toFixed(4),
      bodyVertexCount: String(countVertices(outfit.body)),
      bodySource: `/models/bodies/${bodyModel}.glb`,
      garment: product.id,
      garmentSource: dressed ? product.model3D?.exterior : '',
      garmentVertexCount: String(
        outfit.clothes.filter((g) => g.selected).reduce((sum, g) => sum + countVertices(g.mesh), 0),
      ),
      outfit: dressed ? 'dressed' : 'body',
    });
    onReady();
    invalidate();
  }, [
    outfit,
    identity,
    profile,
    bodyModel,
    skin,
    color,
    fit,
    dressed,
    product.id,
    product.model3D,
    gl,
    onReady,
    invalidate,
  ]);

  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    canvas.addEventListener('webglcontextlost', lost);
    return () => canvas.removeEventListener('webglcontextlost', lost);
  }, [gl, onError]);
  const floor = -profile.height / 100;
  return (
    <>
      {outfit && outfit.identity === identity && (
        <>
          <primitive object={outfit.body} dispose={null} />
          {outfit.clothes.map((g, i) => (
            <primitive key={i} object={g.mesh} dispose={null} />
          ))}
        </>
      )}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floor - 0.025, 0]}>
        <circleGeometry args={[1.05, 64]} />
        <meshStandardMaterial color="#28213d" roughness={0.65} metalness={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floor - 0.02, 0]}>
        <ringGeometry args={[1.04, 1.055, 80]} />
        <meshBasicMaterial color="#ad91ff" />
      </mesh>
    </>
  );
}
export default function FittingScene(props: Props) {
  return (
    <Boundary onError={props.onError}>
      <Canvas
        dpr={[1, 1.5]}
        frameloop={props.visible ? (props.rotate && !props.reduced ? 'always' : 'demand') : 'never'}
        camera={{ position: [0, 0.2, 7.2], fov: 32, near: 0.1, far: 30 }}
        gl={{ antialias: true, alpha: true }}
        aria-label={`Cuerpo ${props.bodyModel === 'male' ? 'masculino' : 'femenino'} 3D${props.dressed ? ` con ${props.product.name}` : ''}`}
      >
        <ambientLight intensity={0.9} />
        <hemisphereLight args={['#f1e8ff', '#191526', 1.2]} />
        <directionalLight position={[3, 5, 5]} intensity={2.2} color="#fff3e8" />
        <directionalLight position={[-4, 2, 3]} intensity={1.1} color="#c6b8ff" />
        <directionalLight position={[2, 4, -3]} intensity={2} color="#b9f1ff" />
        <Avatar {...props} />
        <CameraController
          command={props.command}
          reducedMotion={props.reduced}
          interior={false}
          autoRotate={props.rotate && !props.reduced && props.visible}
        />
      </Canvas>
    </Boundary>
  );
}
