import { lazy, Suspense, useRef, useState } from 'react';
import { useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Box, Check, LoaderCircle, MousePointer2, Rotate3D } from 'lucide-react';
import { products } from '../../data/products';
import { Reveal } from './Reveal';

const ProductViewer = lazy(() =>
  import('../viewer/ProductViewer').then((module) => ({ default: module.ProductViewer })),
);
function canLoadAutomatically() {
  const device = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  return (
    window.innerWidth >= 900 && !device.connection?.saveData && (device.deviceMemory || 8) >= 4
  );
}
export function Showroom() {
  const root = useRef<HTMLElement>(null);
  const near = useInView(root, { once: true, margin: '100px' });
  const [activated, setActivated] = useState(canLoadAutomatically);
  const [id, setId] = useState(products[8].id);
  const product = products.find((item) => item.id === id)!;
  const [color, setColor] = useState(product.colors[0].hex);
  const choose = (next: string) => {
    setId(next);
    setColor(products.find((item) => item.id === next)!.colors[0].hex);
  };
  return (
    <section
      className="cyber-showroom"
      ref={root}
      id="cyber-showroom"
      aria-labelledby="showroom-title"
    >
      <div className="cyber-container">
        <Reveal className="cyber-section-heading">
          <div>
            <span className="cyber-eyebrow">02 / REAL-TIME EXPLORATION</span>
            <h2 id="showroom-title">
              La realidad tiene
              <br />
              <em>más de un ángulo.</em>
            </h2>
          </div>
          <span className="showroom-chip">
            <Box size={14} /> SHOWROOM / 3D INTERACTIVO
          </span>
        </Reveal>
        <Reveal className="cyber-showroom-grid">
          <div className="showroom-stage">
            {activated && near ? (
              <Suspense
                fallback={
                  <div className="showroom-loading">
                    <LoaderCircle className="spinner" size={23} /> Preparando el showroom...
                  </div>
                }
              >
                <ProductViewer key={id} product={product} color={color} />
              </Suspense>
            ) : (
              <div className="showroom-poster">
                <span className="showroom-preview-label">VISTA PREVIA / IMAGEN DEL MODELO</span>
                <img src={product.images[0].src} alt={product.images[0].alt} loading="lazy" />
                <button className="cyber-button" onClick={() => setActivated(true)}>
                  Activar showroom 3D <Rotate3D size={18} />
                </button>
                <span>Activa la escena cuando quieras explorar.</span>
              </div>
            )}
          </div>
          <aside className="showroom-inspector">
            <div className="inspector-top">
              <span className="cyber-eyebrow">OBJECT INSPECTOR</span>
              <i className="cyber-status-dot" />
            </div>
            <span className="inspector-index">
              01<span>/ WEAR YOUR IDEAS</span>
            </span>
            <h3>{product.name}</h3>
            <p>{product.shortDescription}</p>
            <label className="showroom-selector">
              OBJETO EN EXPLORACIÓN
              <select value={id} onChange={(event) => choose(event.target.value)}>
                {products
                  .filter((item) => item.published && item.model3D)
                  .map((item) => (
                    <option value={item.id} key={item.id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </label>
            <fieldset className="showroom-colors">
              <legend>COLOR / {product.colors.find((item) => item.hex === color)?.name}</legend>
              {product.colors.map((item) => (
                <button
                  style={{ background: item.hex }}
                  aria-label={`Showroom color ${item.name}`}
                  aria-pressed={color === item.hex}
                  onClick={() => setColor(item.hex)}
                  key={item.name}
                >
                  {color === item.hex && <Check size={15} />}
                </button>
              ))}
            </fieldset>
            <div className="inspector-tips">
              <MousePointer2 size={19} />
              <p>
                Arrastra para girar.
                <br />
                Acércate para descubrir.
                <br />
                Haz doble clic para enfocar.
              </p>
            </div>
            <Link className="cyber-button secondary" to={`/producto/${id}`}>
              Explorar esta prenda <ArrowUpRight size={19} />
            </Link>
            <Link className="inspector-fit-link" to={`/probador?prenda=${id}`}>
              Ver en mi versión digital <ArrowUpRight size={15} />
            </Link>
            <small>
              Modelos y materiales conceptuales.
              <br />
              Sin simulación física del tejido.
            </small>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
