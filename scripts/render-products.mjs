import { mkdir, writeFile } from 'node:fs/promises';
import { withStudio } from './studio-runner.mjs';
const products=[
  ['hoodie-compile','hoodie','#e8e5da'],
  ['camiseta-source','tee','#e8e5da'],
  ['camisa-runtime','shirt','#e8e5da'],
  ['jeans-branch','jeans','#405473'],
  ['buzo-loop','sweatshirt','#e8e5da'],
  ['sudadera-flow','joggers','#e8e5da'],
  ['camiseta-hello','tee','#a99aff'],
  ['gorra-commit','cap','#a99aff'],
  ['chaqueta-deploy','jacket','#e8e5da']
];
await mkdir('public/images/products',{recursive:true});
await withStudio(async page=>{
 for(const [id,kind,color] of products){
  for(const view of ['front','back']){
   const data=await page.evaluate(({url,view,color})=>window.renderAsset(url,view,color),{url:`/models/garments/${kind}.glb`,view,color});
   await writeFile(`public/images/products/${id}-${view}.webp`,Buffer.from(data.split(',')[1],'base64'));
  }
  console.log(`Rendered ${id}: front and back from GLB`);
 }
});
