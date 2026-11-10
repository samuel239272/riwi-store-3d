import * as THREE from 'three';

const fabric = color => new THREE.MeshStandardMaterial({ name: 'fabric', color, roughness: .82, metalness: 0 });
const trim = new THREE.MeshStandardMaterial({ color: '#191c49', roughness: .7 });
const print = new THREE.MeshStandardMaterial({ color: '#191c49', roughness: .55, metalness: .02 });
const add = (root, geometry, material, position, scale = [1, 1, 1], rotation = [0, 0, 0]) => { const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); mesh.scale.set(...scale); mesh.rotation.set(...rotation); mesh.castShadow = mesh.receiveShadow = true; root.add(mesh); return mesh; };
const box = (x,y,z) => new THREE.BoxGeometry(x,y,z,3,4,2);
const capsule = (r,l) => new THREE.CapsuleGeometry(r,l,8,16);
function top(kind) {
  const root = new THREE.Group(), main = fabric(kind === 'shirt' ? '#f0ebdf' : kind === 'hoodie' ? '#b9a8ef' : '#e8e5da');
  add(root, box(2.65, 2.15, .55), main, [0, .1, 0], [1, 1, 1], [0, 0, 0]);
  add(root, capsule(.42, 1.35), main, [-1.52,.45,0], [1,1,.7], [0,0,.75]);
  add(root, capsule(.42, 1.35), main, [1.52,.45,0], [1,1,.7], [0,0,-.75]);
  add(root, new THREE.TorusGeometry(.44,.11,8,24), trim, [0,1.17,.29], [1,.58,1]);
  if(kind === 'hoodie') { add(root, new THREE.TorusGeometry(.74,.26,8,24,Math.PI), main, [0,1.18,-.03], [1,.85,1], [0,0,Math.PI]); add(root,new THREE.CylinderGeometry(.05,.05,.66,8),trim,[-.15,.65,.32],[1,1,1],[.12,0,0]); add(root,new THREE.CylinderGeometry(.05,.05,.66,8),trim,[.15,.65,.32],[1,1,1],[.12,0,0]); add(root,box(1.25,.48,.2),main,[0,-.52,.35]); }
  if(kind === 'shirt') { for(let y=.7;y>-.75;y-=.37)add(root,new THREE.SphereGeometry(.05,8,8),trim,[0,y,.31]); add(root,box(.62,.35,.2),main,[-.72,.35,.32]); }
  add(root, new THREE.PlaneGeometry(1.08,.34), print, [0,.22,.287]);
  return root;
}
function pants(kind) { const root=new THREE.Group(), main=fabric(kind === 'jeans' ? '#26374b' : '#484652'); add(root,box(1.22,2.9,.58),main,[-.68,0,0]);add(root,box(1.22,2.9,.58),main,[.68,0,0]);add(root,box(2.62,.26,.62),main,[0,1.4,0]);add(root,new THREE.TorusGeometry(.13,.035,6,12),trim,[0,1.39,.32],[1,.6,1]); for(const x of [-1.1,1.1])add(root,new THREE.PlaneGeometry(.07,2.45),trim,[x,0,.3]); return root; }
function cap(){const root=new THREE.Group(),main=fabric('#e8e5da');add(root,new THREE.SphereGeometry(1,16,12,0,Math.PI*2,0,Math.PI/2),main,[0,0,0],[1, .7, 1]);add(root,new THREE.SphereGeometry(1,16,12,0,Math.PI,0,Math.PI/2),main,[0,-.02,.72],[1,.16,.75],[0,0,0]);add(root,new THREE.PlaneGeometry(.78,.25),print,[0,.22,.76]);return root;}
export function makeGarment(kind) { const root = kind === 'jeans' || kind === 'joggers' ? pants(kind) : kind === 'cap' ? cap() : top(kind); root.name=`RIWI provisional ${kind}`; root.position.y=0; return root; }
