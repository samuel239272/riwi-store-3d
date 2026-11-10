import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUpRight, Box, Image, ChevronRight, Plus, Minus, ShoppingBag, Ruler, Check, ArrowLeft } from 'lucide-react';
import { products } from '../data/products';
import { catalogService } from '../services/catalog';
import { categoryName } from '../data/categories';
import type { Product } from '../types/product';
import { ProductViewer } from '../components/viewer/ProductViewer';
import { ProductGallery } from '../components/gallery/ProductGallery';
import { Specifications } from '../components/specifications/Specifications';
import { ProductCard } from '../components/catalog/ProductCard';
import { useCart } from '../components/cart/CartProvider';
import { Modal } from '../components/ui/Modal';
import { formatPrice } from '../utils/format';
import NotFoundPage from './NotFoundPage';
import '../styles/commerce.css';
export default function ProductPage() {
  const { id } = useParams();
  const product = catalogService.get(id ?? '');
  return product ? <ProductDetail key={product.id} product={product} /> : <NotFoundPage />;
}
function ProductDetail({ product }: { product: Product }) {
  const [view, setView] = useState<'3d' | 'images'>('3d');
  const [size, setSize] = useState(product.sizes.includes('M') ? 'M' : product.sizes[0]);
  const [color, setColor] = useState(product.colors[0].name);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuide, setSizeGuide] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem, items } = useCart();
  const inCart = items.filter(item => item.productId === product.id).reduce((sum, item) => sum + item.quantity, 0);
  const available = Math.max(0, product.stock - inCart);
  const selectedColor = product.colors.find(option => option.name === color)!;
  const related = products.filter(item => item.published && item.id !== product.id).sort((a, b) => Number(b.category === product.category) - Number(a.category === product.category)).slice(0, 4);
  const add = () => { if (addItem(product.id, size, color, Math.min(quantity, available))) setAdded(true); };
  return <div className="page-width product-page">
    <nav className="breadcrumbs" aria-label="Ruta de navegación"><Link to="/catalogo">Colección</Link><ChevronRight size={13} /><Link to={`/catalogo?categoria=${product.category}`}>{categoryName(product.category)}</Link><ChevronRight size={13} /><span>{product.name}</span></nav>
    <div className="product-detail-grid">
      <section className="product-media" aria-label="Exploración del producto"><div className="media-tabs"><button aria-pressed={view === '3d'} onClick={() => setView('3d')}><Box size={16} /> Explorar 360°</button><button aria-pressed={view === 'images'} onClick={() => setView('images')}><Image size={16} /> Galería</button><span className="mono">INTERACTIVE STUDIO</span></div>{view === '3d' ? <ProductViewer product={product} color={selectedColor.hex} onGallery={() => setView('images')} /> : <ProductGallery product={product} />}<Link className="try-on-link" to={`/probador?prenda=${product.id}&color=${encodeURIComponent(selectedColor.hex)}`}><Ruler size={18}/><span>¿Cómo se vería en ti?<strong>Probar en mi cuerpo</strong></span><ArrowUpRight size={21}/></Link><div className="media-description"><span className="mono">MODELO 3D CONCEPTUAL</span><span>Diseñado para verlo todo.</span></div></section>
      <section className="product-info" aria-label="Información del producto"><span className="eyebrow">{product.collection.toUpperCase()} / {product.reference}</span><h1>{product.name}</h1><p className="product-subtitle">{product.shortDescription}</p><div className="product-price"><strong>{formatPrice(product.promoPrice ?? product.price)}</strong>{product.promoPrice && <del>{formatPrice(product.price)}</del>}<span>COP</span></div><p className="product-description">{product.description}</p>
        <fieldset className="product-colors"><legend>Color <strong>{color}</strong></legend><div className="color-options">{product.colors.map(option => <button key={option.name} type="button" aria-label={`Color ${option.name}`} aria-pressed={color === option.name} style={{ '--swatch': option.hex } as React.CSSProperties} onClick={() => { setColor(option.name); setAdded(false); }}><span />{color === option.name && <Check size={15} />}</button>)}</div></fieldset>
        <fieldset className="product-sizes"><legend>Talla <strong>{size}</strong></legend><button className="size-guide-link" type="button" onClick={() => setSizeGuide(true)}><Ruler size={15} /> Guía de tallas</button><div className="size-options">{product.sizes.map(option => <button key={option} type="button" aria-label={`Talla ${option}`} aria-pressed={size === option} onClick={() => { setSize(option); setAdded(false); }}>{option}</button>)}</div></fieldset>
        <div className="buy-row"><div className="quantity-control"><button type="button" aria-label="Reducir cantidad" disabled={quantity <= 1} onClick={() => setQuantity(value => value - 1)}><Minus size={16} /></button><input aria-label="Cantidad" type="number" min="1" max={available || 1} value={Math.min(quantity, available || 1)} onChange={event => setQuantity(Math.max(1, Math.min(available || 1, Math.floor(Number(event.target.value) || 1))))} /><button type="button" aria-label="Aumentar cantidad" disabled={quantity >= available} onClick={() => setQuantity(value => value + 1)}><Plus size={16} /></button></div><button className="button primary add-to-cart" disabled={available < 1} onClick={add}><ShoppingBag size={18} />{available ? 'Agregar al carrito' : 'Sin disponibilidad'}</button></div>
        <p className="stock-note"><i /> {available} unidades de muestra disponibles{inCart > 0 ? ` · ${inCart} en tu carrito` : ''}</p>{added && <div className="added-feedback" role="status"><Check size={17} /> Agregado a tu selección.<Link to="/carrito">Ver carrito <ArrowUpRight size={15} /></Link></div>}
        <details className="product-details" open><summary>Detalles de la prenda <Plus size={16} /></summary><Specifications product={product} /></details><details className="product-details"><summary>Cuidado y composición <Plus size={16} /></summary><p>La composición y las instrucciones de lavado deben confirmarse con el proveedor de la prenda final. Esta colección utiliza materiales y acabados de referencia.</p></details><p className="sample-note">Diseño, precio e inventario de muestra. Las ventas y los pagos aún no están habilitados.</p>
      </section>
    </div>
    <section className="related-section"><div className="related-heading"><div><span className="eyebrow">COMPLETE YOUR STACK</span><h2>Funciona mejor en equipo.</h2></div><Link className="text-link" to="/catalogo">Ver colección <ArrowUpRight size={18} /></Link></div><div className="product-grid">{related.map(item => <ProductCard key={item.id} product={item} />)}</div></section><Link to="/catalogo" className="back-catalog"><ArrowLeft size={16} /> Volver a la colección</Link>
    {sizeGuide && <Modal title="Guía de tallas" onClose={() => setSizeGuide(false)}><div className="size-guide-content"><p>Las tallas de esta colección son de muestra. Consulta las medidas de la prenda final antes de comprar cuando la tienda habilite ventas.</p><table><caption>Cómo elegir tu talla</caption><thead><tr><th>Medida</th><th>Cómo tomarla</th></tr></thead><tbody><tr><td>Pecho</td><td>Rodea la parte más ancha con una cinta horizontal.</td></tr><tr><td>Cintura</td><td>Mide el contorno sin ajustar la cinta.</td></tr><tr><td>Largo</td><td>Compara con una prenda que te quede bien.</td></tr></tbody></table><p className="sample-note">Tabla de medidas del fabricante pendiente. No se han inventado equivalencias entre tallas y centímetros.</p></div></Modal>}
  </div>;
}

