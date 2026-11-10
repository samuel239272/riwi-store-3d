import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, SlidersHorizontal } from 'lucide-react';
import { products } from '../../data/products';
import { ProductCard } from '../catalog/ProductCard';
import { Reveal } from './Reveal';

export function Products() {
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('curated');
  const selection = useMemo(() => {
    const list =
      category === 'all'
        ? [products[0], products[8], products[1], products[7]]
        : products.filter((product) => product.published && product.category === category);
    return sort === 'price'
      ? [...list].sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price))
      : sort === 'name'
        ? [...list].sort((a, b) => a.name.localeCompare(b.name))
        : list;
  }, [category, sort]);
  return (
    <section className="cyber-products cyber-container" id="cyber-products">
      <Reveal className="cyber-section-heading">
        <div>
          <span className="cyber-eyebrow">03 / THE SOURCE COLLECTION</span>
          <h2>
            Fuera de la pantalla.
            <br />
            <em>Dentro de tu mundo.</em>
          </h2>
        </div>
        <Link className="cyber-text-button" to="/catalogo">
          Ver las {products.filter((product) => product.published).length} prendas{' '}
          <ArrowUpRight size={18} />
        </Link>
      </Reveal>
      <div className="cyber-products-toolbar">
        <div className="cyber-filters" aria-label="Filtrar colección">
          {[
            ['all', 'Selección'],
            ['hoodies', 'Hoodies'],
            ['camisetas', 'Camisetas'],
            ['chaquetas', 'Outerwear'],
          ].map(([id, label]) => (
            <button key={id} aria-pressed={category === id} onClick={() => setCategory(id)}>
              {label}
            </button>
          ))}
        </div>
        <label className="cyber-sort">
          <SlidersHorizontal size={13} />
          <select
            aria-label="Ordenar selección"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="curated">Selección curada</option>
            <option value="price">Menor precio</option>
            <option value="name">Nombre A–Z</option>
          </select>
        </label>
      </div>
      <div className="cyber-products-grid">
        {selection.map((product, index) => (
          <Reveal key={product.id} delay={index * 0.06}>
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
      <div className="cyber-products-note">
        <span>
          Colección conceptual. Precios, inventario y diseños de demostración pendientes de
          aprobación por RIWI.
        </span>
        <span role="status">
          {String(selection.length).padStart(2, '0')} OBJETOS / LISTOS PARA EXPLORAR
        </span>
      </div>
    </section>
  );
}
