import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { categoryName } from '../../data/categories';
import { formatPrice } from '../../utils/format';
import '../../styles/commerce.css';
export function ProductCard({ product }: { product: Product }) {
  return <Link to={`/producto/${product.id}`} className="product-card" aria-label={`Explorar ${product.name}`}>
    <div className="card-image">
      <div className="card-tags"><span>{product.promoPrice ? 'SPECIAL PRICE' : product.collection === 'First Commit' ? 'EDICIÓN ESPECIAL' : 'NEW DROP'}</span><span>360°</span></div>
      <img className="card-front" src={product.images[0].src} alt={product.images[0].alt} loading="lazy" width="640" height="640" />
      {product.images[1] && <img className="card-back" src={product.images[1].src} alt="" loading="lazy" width="640" height="640" />}
      <span className="card-open"><ArrowUpRight size={22} /></span>
      <span className="card-colors" aria-label={`${product.colors.length} colores disponibles`}>{product.colors.map(color => <i key={color.name} style={{ background: color.hex }} />)}</span>
    </div>
    <div className="card-content"><div className="card-title-row"><h3>{product.name}</h3><strong>{formatPrice(product.promoPrice ?? product.price)}</strong></div><div className="card-description-row"><p>{categoryName(product.category)} · {product.shortDescription}</p>{product.promoPrice && <del>{formatPrice(product.price)}</del>}</div></div>
  </Link>;
}
