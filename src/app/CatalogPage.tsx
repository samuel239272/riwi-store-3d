import { useSearchParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { Search, SlidersHorizontal, X, ArrowUpRight } from 'lucide-react';
import { categories } from '../data/categories';
import { products } from '../data/products';
import { useProducts, type ProductSort } from '../hooks/useProducts';
import { ProductCard } from '../components/catalog/ProductCard';
import '../styles/commerce.css';
export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const latest = useRef(params);
  const [query, setQuery] = useState(params.get('q') ?? '');
  useEffect(() => {
    latest.current = params;
    setQuery(params.get('q') ?? '');
  }, [params]);
  const category = categories.some(item => item.id === params.get('categoria')) ? params.get('categoria')! : 'all';
  const size = params.get('talla') ?? '';
  const color = params.get('color') ?? '';
  const collection = params.get('coleccion') ?? '';
  const rawSort = params.get('orden');
  const sort: ProductSort = ['price-asc', 'price-desc', 'name-asc', 'newest'].includes(rawSort ?? '') ? rawSort as ProductSort : 'featured';
  const filtered = useProducts({ query, category, size, color, collection, sort });
  const published = products.filter(product => product.published);
  const sizes = [...new Set(published.flatMap(product => product.sizes))];
  const colors = [...new Set(published.flatMap(product => product.colors.map(option => option.name)))];
  const collections = [...new Set(published.map(product => product.collection))];
  const update = (key: string, value: string) => {
    const next = new URLSearchParams(latest.current);
    if (value && value !== 'all' && value !== 'featured') next.set(key, value); else next.delete(key);
    latest.current = next;
    setParams(next, { replace: true });
  };
  const clear = () => { setQuery(''); latest.current = new URLSearchParams(); setParams({}); };
  return <div className="page-width catalog-page">
    <header className="commerce-intro"><span className="eyebrow">~/RIWI / COLLECTION</span><h1>Encuentra tu<br /><em>próxima versión.</em></h1><p>Prendas para quienes imaginan, crean y construyen. Explora cada detalle en 360°.</p></header>
    <div className="catalog-toolbar"><label className="search-field"><Search size={20} /><input value={query} onChange={event => { setQuery(event.target.value); update('q', event.target.value); }} placeholder="Busca tu próximo favorito..." aria-label="Buscar por nombre o referencia" />{query && <button aria-label="Borrar búsqueda" onClick={() => { setQuery(''); update('q', ''); }}><X size={17} /></button>}</label><label className="sort-field"><SlidersHorizontal size={17} /><span className="sr-only">Ordenar productos</span><select aria-label="Ordenar productos" value={sort} onChange={event => update('orden', event.target.value)}><option value="featured">Destacados</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option><option value="name-asc">Nombre: A–Z</option><option value="newest">Más recientes</option></select></label></div>
    <div className="catalog-categories" aria-label="Filtrar por categoría">{[{ id: 'all', name: 'Todo el drop' }, ...categories].map(item => {
      const count = item.id === 'all' ? published.length : published.filter(product => product.category === item.id).length;
      return <button key={item.id} aria-label={`${item.name}${count}`} aria-pressed={category === item.id} onClick={() => update('categoria', item.id)}>{item.name}<span>{count}</span></button>;
    })}</div>
    <div className="catalog-filter-row"><label>Talla<select aria-label="Filtrar por talla" value={size} onChange={event => update('talla', event.target.value)}><option value="">Todas</option>{sizes.map(item => <option key={item}>{item}</option>)}</select></label><label>Color<select aria-label="Filtrar por color" value={color} onChange={event => update('color', event.target.value)}><option value="">Todos</option>{colors.map(item => <option key={item}>{item}</option>)}</select></label><label>Colección<select aria-label="Filtrar por colección" value={collection} onChange={event => update('coleccion', event.target.value)}><option value="">Todas</option>{collections.map(item => <option key={item}>{item}</option>)}</select></label><span aria-live="polite" className="result-count mono">{String(filtered.length).padStart(2, '0')} PRODUCTOS</span>{params.size > 0 && <button className="clear-filters" onClick={clear}>Limpiar filtros <X size={14} /></button>}</div>
    {filtered.length ? <div className="product-grid catalog-grid">{filtered.map(product => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><Search size={32} /><h2>No encontramos ese producto.</h2><p>Prueba con otro término o cambia los filtros.</p><button className="button primary" onClick={clear}>Ver todos los productos <ArrowUpRight size={18} /></button></div>}
    <p className="catalog-disclaimer">Colección conceptual. Precios, disponibilidad, materiales y diseños de muestra pendientes de aprobación por RIWI.</p>
  </div>;
}
