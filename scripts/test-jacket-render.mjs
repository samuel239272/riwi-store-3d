import { chromium } from '@playwright/test';
import { launchOptions } from './qa-browser.mjs';

const browser = await chromium.launch(launchOptions);
const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });

page.on('console', msg => console.log('LOG:', msg.type(), msg.text()));
page.on('pageerror', err => console.error('ERROR:', err.message));

await page.goto('http://127.0.0.1:5173/scripts/asset-studio.html');

const result = await page.evaluate(async () => {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const THREE = await import('three');
  
  const loader = new GLTFLoader();
  try {
    const gltf = await loader.loadAsync('/models/garments/jacket.glb');
    console.log('Jacket GLTF loaded without error in browser!');
    
    // Now let's try rendering it with a WebGLRenderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    const scene = new THREE.Scene();
    scene.add(gltf.scene);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 5);
    
    renderer.render(scene, camera);
    console.log('Render 1 passed!');
    
    // Let's test the ModelLoader texture update:
    gltf.scene.traverse(o => {
      if (o.isMesh && o.material?.name === 'fabric') {
        o.material.color.set('#28272d');
        o.material.needsUpdate = true;
      }
    });
    renderer.render(scene, camera);
    console.log('Render 2 passed!');
    return 'SUCCESS';
  } catch (e) {
    console.error('FAILED:', e);
    return e.message;
  }
});

console.log('Test result:', result);
await browser.close();

