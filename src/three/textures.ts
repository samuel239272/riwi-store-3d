import * as T from 'three';

export type FabricPattern = 'cotton' | 'denim' | 'ribbed' | 'canvas';

export interface TextureBundle {
  normalMap: T.CanvasTexture;
  roughnessMap: T.CanvasTexture;
  diffuseMap: T.CanvasTexture;
}

const bundleCache = new Map<string, TextureBundle>();
let leatherTextureCache: T.CanvasTexture | undefined;

export function getFabricTextures(type: FabricPattern = 'cotton', repeatCount = 32): TextureBundle | undefined {
  if (typeof document === 'undefined') return undefined;

  const key = `${type}_${repeatCount}`;
  if (bundleCache.has(key)) return bundleCache.get(key)!;

  const size = 512;
  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = size;
  normalCanvas.height = size;
  const normCtx = normalCanvas.getContext('2d');

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const roughCtx = roughCanvas.getContext('2d');

  const diffCanvas = document.createElement('canvas');
  diffCanvas.width = size;
  diffCanvas.height = size;
  const diffCtx = diffCanvas.getContext('2d');

  if (!normCtx || !roughCtx || !diffCtx) return undefined;

  const normImg = normCtx.createImageData(size, size);
  const roughImg = roughCtx.createImageData(size, size);
  const diffImg = diffCtx.createImageData(size, size);
  const nData = normImg.data;
  const rData = roughImg.data;
  const dData = diffImg.data;

  // Generate high-density micro-heightfield and tonal wash variation (512x512)
  const heights = new Float32Array(size * size);
  const roughVals = new Uint8Array(size * size);
  const toneVals = new Uint8Array(size * size);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let h = 0;
      let rough = 210;
      let tone = 242; // baseline neutral white tone multiplier

      if (type === 'denim') {
        // 3/1 Right-hand twill weave with yarn slub, diagonal ridge, and stone-wash micro-variance
        const diag = (x + y) * 0.35;
        const ridge = Math.sin(diag) * 0.65;
        const cross = Math.sin(x * 0.7) * Math.cos(y * 0.7) * 0.25;
        const slub = Math.sin(x * 0.08 + Math.cos(y * 0.12) * 2) * 0.18;
        const fuzz = (Math.sin(x * 3.1) * Math.cos(y * 2.9)) * 0.08;

        h = ridge + cross + slub + fuzz;
        rough = Math.floor(200 + (1 - (ridge * 0.5 + 0.5)) * 45);
        // Stone-wash yarn highlight on ridges and darker indigo in yarn crevices
        const yarnShading = (ridge * 0.5 + 0.5) * 28;
        tone = Math.floor(228 + yarnShading + (Math.sin(x * 0.04) * 8));
      } else if (type === 'ribbed') {
        // 2x2 Rib-knit: alternating vertical knit wales and recessed purl channels
        const ribPeriod = 32;
        const ribPhase = ((x % ribPeriod) / ribPeriod) * Math.PI * 2;
        const ribShape = Math.sin(ribPhase);
        const ribYarn = Math.sin(y * 0.8) * 0.15;
        const microGrain = (Math.sin(x * 2.2) * Math.cos(y * 1.8)) * 0.08;

        h = (ribShape > 0 ? Math.sqrt(Math.max(0, ribShape)) : -Math.sqrt(Math.max(0, -ribShape)) * 0.85) * 0.85 + ribYarn + microGrain;
        rough = Math.floor(190 + (ribShape < 0 ? 55 : 20));
        // Deepen shadows in purl valleys and highlight knit ribs
        tone = Math.floor(236 + (ribShape * 18));
      } else if (type === 'canvas') {
        // Structured 2x2 Basketweave
        const blockX = Math.floor(x / 8) % 2;
        const blockY = Math.floor(y / 8) % 2;
        const isWarp = (blockX ^ blockY) === 0;

        const u = isWarp ? Math.sin((x % 8) / 8 * Math.PI) : Math.sin((y % 8) / 8 * Math.PI);
        const strand = Math.sin((x + y) * 0.6) * 0.15;
        h = u * 0.7 + strand;
        rough = Math.floor(215 + (1 - u) * 35);
        tone = Math.floor(235 + u * 18);
      } else {
        // Cotton Interlock Knit: V-shaped interlocking loops and heather micro-speckles
        const course = y * 0.5;
        const wale = x * 0.5;
        const loopV = Math.abs(Math.sin(wale) - 0.5) * 2;
        const loopRow = Math.sin(course + Math.sin(wale) * 0.5);
        const knit = (loopV * 0.4 + loopRow * 0.45);
        const fuzz = Math.sin(x * 1.4 + y * 0.7) * 0.12 + Math.cos(x * 0.8 - y * 1.5) * 0.1;

        h = knit + fuzz;
        rough = Math.floor(205 + (1 - (knit * 0.5 + 0.5)) * 38);
        // Heather cotton spun yarn variation
        tone = Math.floor(240 + (knit * 14) + (Math.sin(x * 2.7 + y * 3.3) * 6));
      }

      const idx = y * size + x;
      heights[idx] = h;
      roughVals[idx] = rough;
      toneVals[idx] = tone;
    }
  }

  // Convert heightfield to precision tangent-space normal map using 4-tap Sobel filter
  const strength = type === 'ribbed' ? 3.2 : type === 'denim' ? 2.6 : 1.9;
  for (let y = 0; y < size; y++) {
    const ym = (y - 1 + size) % size;
    const yp = (y + 1) % size;
    const ymRow = ym * size;
    const yRow = y * size;
    const ypRow = yp * size;

    for (let x = 0; x < size; x++) {
      const xm = (x - 1 + size) % size;
      const xp = (x + 1) % size;

      const dx = (
        (heights[ypRow + xp] + 2 * heights[yRow + xp] + heights[ymRow + xp]) -
        (heights[ypRow + xm] + 2 * heights[yRow + xm] + heights[ymRow + xm])
      ) * (strength / 8);

      const dy = (
        (heights[ypRow + xm] + 2 * heights[ypRow + x] + heights[ypRow + xp]) -
        (heights[ymRow + xm] + 2 * heights[ymRow + x] + heights[ymRow + xp])
      ) * (strength / 8);

      let nx = -dx;
      let ny = -dy;
      let nz = 1.0;
      const invLen = 1.0 / Math.hypot(nx, ny, nz);
      nx *= invLen;
      ny *= invLen;
      nz *= invLen;

      const pIdx = (yRow + x) * 4;
      nData[pIdx] = Math.floor((nx * 0.5 + 0.5) * 255);
      nData[pIdx + 1] = Math.floor((ny * 0.5 + 0.5) * 255);
      nData[pIdx + 2] = Math.floor((nz * 0.5 + 0.5) * 255);
      nData[pIdx + 3] = 255;

      const rVal = roughVals[yRow + x];
      rData[pIdx] = rVal;
      rData[pIdx + 1] = rVal;
      rData[pIdx + 2] = rVal;
      rData[pIdx + 3] = 255;

      const tVal = toneVals[yRow + x];
      dData[pIdx] = tVal;
      dData[pIdx + 1] = tVal;
      dData[pIdx + 2] = tVal;
      dData[pIdx + 3] = 255;
    }
  }

  normCtx.putImageData(normImg, 0, 0);
  roughCtx.putImageData(roughImg, 0, 0);
  diffCtx.putImageData(diffImg, 0, 0);

  const normalMap = new T.CanvasTexture(normalCanvas);
  normalMap.wrapS = T.RepeatWrapping;
  normalMap.wrapT = T.RepeatWrapping;
  normalMap.repeat.set(repeatCount, repeatCount);
  normalMap.needsUpdate = true;

  const roughnessMap = new T.CanvasTexture(roughCanvas);
  roughnessMap.wrapS = T.RepeatWrapping;
  roughnessMap.wrapT = T.RepeatWrapping;
  roughnessMap.repeat.set(repeatCount, repeatCount);
  roughnessMap.needsUpdate = true;

  const diffuseMap = new T.CanvasTexture(diffCanvas);
  diffuseMap.wrapS = T.RepeatWrapping;
  diffuseMap.wrapT = T.RepeatWrapping;
  diffuseMap.repeat.set(repeatCount, repeatCount);
  diffuseMap.needsUpdate = true;

  const bundle: TextureBundle = { normalMap, roughnessMap, diffuseMap };
  bundleCache.set(key, bundle);
  return bundle;
}

export function getFabricNormalMap(type: FabricPattern = 'cotton', repeatCount = 32): T.CanvasTexture | undefined {
  return getFabricTextures(type, repeatCount)?.normalMap;
}

// -------------------------------------------------------------
// VINTAGE LEATHER JACRON PATCH (Denim Waistband Brand Badge)
// -------------------------------------------------------------
export function getLeatherJacronTexture(): T.CanvasTexture | undefined {
  if (typeof document === 'undefined') return undefined;
  if (leatherTextureCache) return leatherTextureCache;

  const w = 256;
  const h = 140;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return undefined;

  // Rich cognac / tanned saddle leather background
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#8c5932');
  grad.addColorStop(0.5, '#9a633a');
  grad.addColorStop(1, '#7f4f2c');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Leather pores and grain noise
  ctx.fillStyle = 'rgba(0,0,0,0.06)';
  for (let i = 0; i < 900; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, Math.random() * 2 + 1);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 600; i++) {
    ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 2 + 1, 1);
  }

  // Stitched border around the perimeter
  ctx.strokeStyle = '#d4a36b';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(8, 8, w - 16, h - 16);
  ctx.setLineDash([]);

  // Inner debossed border
  ctx.strokeStyle = '#5a3518';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(14, 14, w - 28, h - 28);

  // Hot-stamped debossed typography
  ctx.fillStyle = '#44250e';
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px "IBM Plex Mono", monospace, sans-serif';
  ctx.fillText('RIWI DENIM', w / 2, 54);

  ctx.font = '11px "Inter", sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillText('QUALITY CLOTHING · ORIGINAL FIT', w / 2, 74);

  ctx.strokeStyle = '#5a3518';
  ctx.beginPath();
  ctx.moveTo(30, 84);
  ctx.lineTo(w - 30, 84);
  ctx.stroke();

  ctx.font = 'bold 12px "IBM Plex Mono", monospace';
  ctx.fillText('LOT RW-004 · W 32 L 32', w / 2, 108);

  const tex = new T.CanvasTexture(canvas);
  tex.needsUpdate = true;
  leatherTextureCache = tex;
  return tex;
}
