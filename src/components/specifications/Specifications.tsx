import type { Product } from '../../types/product';
export function Specifications({ product }: { product: Product }) {
  return <dl className="specification-list">{[['Referencia', product.reference], ['Colección', product.collection], ['Material', product.material], ['Tallas', product.sizes.join(' / ')], ['Colores', product.colors.map(color => color.name).join(' / ')], ['Modelo', 'Geometría 3D conceptual; diseño sujeto a aprobación.']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
}
