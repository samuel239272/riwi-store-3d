import { useSearchParams } from 'react-router-dom';
import { ArrowDownRight } from 'lucide-react';
import { products } from '../data/products';
import { FittingStudio } from '../components/fitting/FittingStudio';
import { usePageMeta } from '../hooks/usePageMeta';
export default function FittingPage() {
  const [params,setParams]=useSearchParams();
  const product=products.find(p=>p.id===params.get('prenda')&&p.published)??products[0];
  usePageMeta('Probador virtual', 'Personaliza un cuerpo masculino o femenino, ajusta su complexión y explora las prendas RIWI en 3D.');
  return <section className="page-width fitting-page"><div className="fitting-intro"><div><span className="eyebrow">RIWI LAB · VIRTUAL FITTING ROOM</span><h1>Tu cuerpo.<br/><em>Tu perspectiva.</em></h1></div><p>De imaginarlo<br/>a verte con él. <ArrowDownRight size={28}/></p></div>
    <label className="fitting-product-select">Elige tu prenda<select value={product.id} onChange={e=>setParams({prenda:e.target.value})}>{products.filter(p=>p.published).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><span>{String(products.filter(p=>p.published).length).padStart(2, '0')} prendas · infinitas perspectivas</span></label>
    <FittingStudio product={product} initialColor={params.get('color')??undefined}/>
  </section>;
}
