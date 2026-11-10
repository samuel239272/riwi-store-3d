import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products } from '../../data/products';
import { formatPrice } from '../../utils/format';
import { useCart } from '../cart/CartProvider';
import { GlassPanel } from './GlassPanel';
import { Reveal } from './ScrollReveal';
import { CodeFashionStage } from './CodeFashionStage';

export function FeaturedSection() {
  const [id, setId] = useState(products[0].id);
  const product = products.find((item) => item.id === id)!;
  const [size, setSize] = useState('M');
  const [color, setColor] = useState(product.colors[0].name);
  const [added, setAdded] = useState(false);
  const { addItem, count } = useCart();
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const choose = (next: string) => {
    const item = products.find((product) => product.id === next)!;
    setId(next);
    setSize(item.sizes.includes('M') ? 'M' : item.sizes[0]);
    setColor(item.colors[0].name);
    setAdded(false);
  };
  const add = () => {
    if (addItem(id, size, color, 1)) {
      setAdded(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setAdded(false), 2000);
    }
  };
  return (
    <section
      className="reborn-section featured-section"
      id="code-collection"
      data-source="identity.riwi.tsx"
    >
      <div className="reborn-container">
        <Reveal className="reborn-section-heading">
          <span className="system-eyebrow">02 / THE CODE COLLECTION</span>
          <h2>
            COMPILE
            <br />
            <em>YOUR STYLE.</em>
          </h2>
          <p>El código cambia. La actitud permanece.</p>
        </Reveal>
        <Reveal>
          <GlassPanel variant="featured" className="featured-panel">
            <div className="featured-product-stage">
              <span className="featured-product-id">RIWI WEAR / {product.reference}</span>
              <CodeFashionStage key={product.id} product={product} size={size} color={color} />
            </div>
            <div className="featured-product-info">
              <span className="system-eyebrow">DROP 001 / NEXT GENERATION</span>
              <h3>{product.name}</h3>
              <p>{product.shortDescription}</p>
              <div className="featured-price">
                <strong>{formatPrice(product.promoPrice || product.price)}</strong>
                <span>COP / PRECIO DE DEMOSTRACIÓN</span>
              </div>
              <label className="featured-product-selector">
                ELIGE TU PIEZA
                <select
                  aria-label="Prenda destacada"
                  value={id}
                  onChange={(event) => choose(event.target.value)}
                >
                  {[products[0], products[1], products[2], products[8], products[7]].map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>
              <fieldset className="featured-sizes">
                <legend>TALLA / {size}</legend>
                {product.sizes.map((item) => (
                  <button
                    key={item}
                    aria-pressed={size === item}
                    aria-label={`Seleccionar talla ${item}`}
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </button>
                ))}
              </fieldset>
              <fieldset className="featured-colors">
                <legend>COLOR / {color}</legend>
                {product.colors.map((item) => (
                  <button
                    key={item.name}
                    aria-label={`Seleccionar color ${item.name}`}
                    aria-pressed={color === item.name}
                    style={{ background: item.hex }}
                    onClick={() => setColor(item.name)}
                  >
                    {color === item.name && <Check size={15} />}
                  </button>
                ))}
              </fieldset>
              <button
                className={`system-button add-to-loadout ${added ? 'is-added' : ''}`}
                onClick={add}
                disabled={!product.stock}
              >
                {added ? (
                  <>
                    <span>AÑADIDO A TU LOADOUT</span>
                    <Check size={18} />
                  </>
                ) : (
                  <>
                    <span>ADD TO LOADOUT</span>
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
              <div className="featured-cart-feedback" role="status">
                <ShoppingBag size={13} /> {String(count).padStart(2, '0')} piezas en tu selección
                local
                <Link to="/carrito">
                  Ver loadout <ArrowUpRight size={12} />
                </Link>
              </div>
              <small>
                Concepto de colección. Diseños, precios y disponibilidad de muestra. Tu selección se
                guarda en este navegador.
              </small>
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </section>
  );
}
