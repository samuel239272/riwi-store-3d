import { Component, Suspense, useEffect, useMemo, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Mesh, SRGBColorSpace } from 'three';
import { createBody, createGarment, categoryKind } from '../three/garments';
import { bodyDimensions, type BodyProfile } from '../utils/bodyProfile';
import { assetUrl } from '../utils/assets';
import { CameraController } from './CameraController';
import type { Product } from '../types/product';
import type { CameraCommand } from '../types/viewer';
type Props = { product:Product; profile:BodyProfile; color:string; skin:string; fit:'regular'|'relaxed'; command:CameraCommand; rotate:boolean; reduced:boolean; visible:boolean; onReady:()=>void; onError:()=>void };
class Boundary extends Component<{ children:ReactNode; onError:()=>void },{failed:boolean}> {
  state={failed:false}; static getDerivedStateFromError(){return {failed:true};} componentDidCatch(){this.props.onError();} render(){return this.state.failed?null:this.props.children;}
}
function Avatar({profile,product,color,skin,fit,onReady,onError}:Props) {
  const logo=useTexture(assetUrl('/logos/riwi-original.png'));
  logo.colorSpace=SRGBColorSpace;
  const {invalidate,gl}=useThree();
  const d=bodyDimensions(profile);
  const model=useMemo(()=>{
    const body=createBody(profile,skin),kind=categoryKind(product.category);
    const bottom=kind==='jeans'||kind==='joggers';
    const underlayer=createGarment(bottom?'tee':'joggers',profile,'#28263a',logo);
    if(!bottom)underlayer.scale.set(.96,1,.95);
    body.add(underlayer);
    if(kind==='cap')body.add(createGarment('tee',profile,'#ded8eb',logo));
    body.add(createGarment(kind,profile,color,logo,fit));
    return body;
  },[profile,product.category,color,skin,logo,fit]);
  useEffect(()=>{onReady();invalidate();return()=>model.traverse(o=>{if(o instanceof Mesh){o.geometry.dispose();for(const m of [o.material].flat())m.dispose();}});},[model,onReady,invalidate]);
  useEffect(()=>{const lost=(e:Event)=>{e.preventDefault();onError();};const canvas=gl.domElement;canvas.addEventListener('webglcontextlost',lost);return()=>canvas.removeEventListener('webglcontextlost',lost);},[gl,onError]);
  useFrame(()=>{gl.domElement.dataset.bodyHeight=profile.height.toString();gl.domElement.dataset.bodyWaist=profile.waist.toString();gl.domElement.dataset.garment=product.id;});
  return <>
    <primitive object={model} dispose={null} />
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-d.h/2-.015,0]}><circleGeometry args={[1.05,64]}/><meshStandardMaterial color="#28213d" roughness={.55} metalness={.2}/></mesh>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-d.h/2-.01,0]}><ringGeometry args={[1.04,1.055,80]}/><meshBasicMaterial color="#ad91ff"/></mesh>
  </>;
}
export default function FittingScene(props:Props) {
  return <Boundary onError={props.onError}><Canvas dpr={[1,1.5]} frameloop={props.visible?(props.rotate&&!props.reduced?'always':'demand'):'never'} camera={{position:[1.1,.3,7.2],fov:38,near:.1,far:30}} gl={{antialias:true,alpha:true}} aria-label={`Maniquí 3D con ${props.product.name}`}>
    <ambientLight intensity={1.5}/><hemisphereLight args={['#f1e8ff','#191526',2]}/>
    <directionalLight position={[3,5,5]} intensity={3.5} color="#fff3e8"/><directionalLight position={[-4,2,3]} intensity={2.5} color="#c6b8ff"/><directionalLight position={[2,4,-3]} intensity={4} color="#b9f1ff"/>
    <Suspense fallback={null}><Avatar {...props}/></Suspense>
    <CameraController command={props.command} reducedMotion={props.reduced} interior={false} autoRotate={props.rotate&&!props.reduced&&props.visible}/>
  </Canvas></Boundary>;
}
