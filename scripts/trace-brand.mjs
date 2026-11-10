// Derive editable vector contours from the supplied transparent brand artwork.
// No font substitution: the original pixel silhouette determines every contour.
import { readFileSync, writeFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
const png = readFileSync('public/logos/riwi-original.png');
let offset = 8, width, height, channels, data = [];
while (offset < png.length) {
  const length = png.readUInt32BE(offset), type = png.toString('ascii', offset + 4, offset + 8), bytes = png.subarray(offset + 8, offset + 8 + length);
  if (type === 'IHDR') { width = bytes.readUInt32BE(0); height = bytes.readUInt32BE(4); channels = bytes[9] === 6 ? 4 : 3; if (bytes[8] !== 8 || ![2, 6].includes(bytes[9])) throw Error('Expected 8-bit RGB/RGBA PNG'); }
  if (type === 'IDAT') data.push(bytes);
  offset += length + 12;
}
const raw = inflateSync(Buffer.concat(data)), stride = width * channels, pixels = Buffer.alloc(width * height * channels);
const paeth = (a,b,c) => { const p=a+b-c, x=Math.abs(p-a),y=Math.abs(p-b),z=Math.abs(p-c); return x<=y&&x<=z?a:y<=z?b:c; };
for(let y=0;y<height;y++) for(let x=0;x<stride;x++) {
  const filter=raw[y*(stride+1)], a=x>=channels?pixels[y*stride+x-channels]:0, b=y?pixels[(y-1)*stride+x]:0, c=y&&x>=channels?pixels[(y-1)*stride+x-channels]:0;
  pixels[y*stride+x]=(raw[y*(stride+1)+x+1]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;
}
const step=2,w=Math.ceil(width/step),h=Math.ceil(height/step);
const filled=(x,y)=> {if(x<0||y<0||x>=w||y>=h)return false; const i=(y*step*width+x*step)*channels; return channels===4?pixels[i+3]>128:Math.max(...pixels.subarray(i,i+3))>10&&Math.min(...pixels.subarray(i,i+3))<240;};
const edges=new Map();
const edge=(x,y,x2,y2)=>edges.set(`${x},${y}`,[x2,y2]);
for(let y=0;y<h;y++) for(let x=0;x<w;x++) if(filled(x,y)) {
  if(!filled(x,y-1))edge(x,y,x+1,y); if(!filled(x+1,y))edge(x+1,y,x+1,y+1);
  if(!filled(x,y+1))edge(x+1,y+1,x,y+1); if(!filled(x-1,y))edge(x,y+1,x,y);
}
function simplify(points,epsilon=0.8) {
  if(points.length<3)return points;
  const a=points[0],b=points.at(-1);let max=0,at=0;
  for(let i=1;i<points.length-1;i++){const p=points[i],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1))),d=Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);if(d>max){max=d;at=i;}}
  return max>epsilon?[...simplify(points.slice(0,at+1),epsilon).slice(0,-1),...simplify(points.slice(at),epsilon)]:[a,b];
}
const contours=[];
while(edges.size){const start=edges.keys().next().value;let key=start,pts=[];while(edges.has(key)){const p=key.split(',').map(Number);pts.push(p);const next=edges.get(key);edges.delete(key);key=next.join(',');if(key===start)break;}if(pts.length<24)continue;
  let sample=pts.find(([x,y])=>filled(x,y)); if(!sample)continue;
  const i=(sample[1]*step*width+sample[0]*step)*channels;
  const color='#'+[...pixels.subarray(i,i+3)].map(c=>c.toString(16).padStart(2,'0')).join('');
  pts.push(pts[0]);contours.push({color,points:simplify(pts).map(p=>p.map(v=>v*step))});
}
const all=contours.flatMap(c=>c.points),minX=Math.min(...all.map(p=>p[0])),maxX=Math.max(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1])),maxY=Math.max(...all.map(p=>p[1]));
const histogram=new Map();for(let i=0;i<pixels.length;i+=channels){if(channels===4&&pixels[i+3]<250)continue;const c=[...pixels.subarray(i,i+3)].join(',');histogram.set(c,(histogram.get(c)||0)+1);}
const palette=[...histogram].sort((a,b)=>b[1]-a[1]).slice(0,2).map(([key])=>key.split(',').map(Number));
const solidColor=color=>{const rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));const nearest=palette.toSorted((a,b)=>a.reduce((s,v,i)=>s+(v-rgb[i])**2,0)-b.reduce((s,v,i)=>s+(v-rgb[i])**2,0))[0];return '#'+nearest.map(v=>v.toString(16).padStart(2,'0')).join('');};
const result={width:maxX-minX,height:maxY-minY,contours:contours.map(c=>({...c,color:solidColor(c.color),points:c.points.map(([x,y])=>[x-minX,y-minY])})).sort((a,b)=>Math.min(...a.points.map(p=>p[0]))-Math.min(...b.points.map(p=>p[0])))};
writeFileSync('src/data/riwiContours.json',JSON.stringify(result));
writeFileSync('public/logos/riwi.svg',`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${result.width} ${result.height}" role="img" aria-label="RIWI">${result.contours.map(c=>`<path fill="${c.color}" d="M${c.points.map(p=>p.join(',')).join('L')}Z"/>`).join('')}</svg>`);
console.log(`Traced ${contours.length} original contours · ${result.width} × ${result.height}`);
