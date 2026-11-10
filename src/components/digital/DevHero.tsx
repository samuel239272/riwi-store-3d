import { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowDown,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  MoveUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { products } from '../../data/products';
import { DataField } from './DataField';
import { useExperience } from './Experience';

const featured = [products[8], products[0], products[1]];

export function DevHero() {
  const root = useRef<HTMLElement>(null);
  const { stopped } = useExperience();
  const [index, setIndex] = useState(0);
  const product = featured[index];
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end start'] });
  const sculptureY = useTransform(scrollYProgress, [0, 1], [0, 130]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -55]);
  const scroll = () =>
    document
      .getElementById('source-collection')
      ?.scrollIntoView({ behavior: stopped ? 'instant' : 'smooth' });
  return (
    <section ref={root} className="dev-hero" aria-label="RIWI Devwear: creatividad en ejecución">
      <div className="hero-coordinate" aria-hidden="true">
        6°14′41.0″N
        <br />
        75°34′29.0″W
      </div>
      <div className="dev-hero-top">
        <span>
          <i className="live-dot" /> DESIGNED FOR HUMAN CREATIVITY
        </span>
        <span>
          COLLECTION_001 <b>↗</b> HELLO, WORLD
        </span>
      </div>
      <div className="dev-hero-grid">
        <motion.div className="dev-hero-copy" style={{ y: stopped ? 0 : titleY }}>
          <div className="dev-label">
            <span className="label-square" /> EL UNIFORME DE TU PRÓXIMA IDEA
          </div>
          <h1>
            EL FUTURO
            <br />
            SE ESCRIBE.
            <br />
            <span className="hero-outline">
              SE VISTE<span className="acid-dot">.</span>
            </span>
          </h1>
          <div className="dev-hero-description">
            <span aria-hidden="true">//</span>
            <p>
              Código en la mente. Creatividad en la piel.
              <br />
              Merch para los que construyen lo que sigue.
            </p>
          </div>
          <div className="dev-hero-actions">
            <Link className="dev-button" to="/catalogo">
              EXPLORAR EL DROP <ArrowUpRight size={20} />
            </Link>
            <button className="dev-text-button" onClick={scroll}>
              INICIAR EXPLORACIÓN <ArrowDown size={15} />
            </button>
          </div>
          <div className="hero-code-signature">
            <span className="signature-bracket">{'{ }'}</span>
            <span>
              BE A CODER.
              <br />
              <b>CHANGE YOUR WORLD.</b>
            </span>
            <span className="signature-line" />
          </div>
        </motion.div>
        <motion.div className="dev-hero-stage" style={{ y: stopped ? 0 : sculptureY }}>
          <div className="stage-crosshair crosshair-tl" aria-hidden="true" />
          <div className="stage-crosshair crosshair-br" aria-hidden="true" />
          <span className="stage-caption">
            <Crosshair size={13} /> LIVE OBJECT / {String(index + 1).padStart(2, '0')}
          </span>
          <DataField />
          <span className="stage-orbit orbit-outer" aria-hidden="true" />
          <span className="stage-orbit orbit-inner" aria-hidden="true" />
          <span className="stage-giant-code" aria-hidden="true">
            &lt;/&gt;
          </span>
          <Link
            to={`/producto/${product.id}`}
            className="hero-garment-link"
            aria-label={`Explorar ${product.name}`}
          >
            <motion.img
              key={product.id}
              initial={stopped ? false : { opacity: 0, y: 30, rotate: -8 }}
              animate={{ opacity: 1, y: 0, rotate: -8 }}
              transition={{ duration: stopped ? 0 : 0.65 }}
              className="hero-garment"
              src={product.images[0].src}
              alt={product.images[0].alt}
              fetchPriority="high"
            />
            <span className="garment-hover">
              INSPECCIONAR OBJETO <MoveUpRight size={15} />
            </span>
          </Link>
          <span className="object-tag tag-left">
            <i /> render.realidad<span>100% CREATIVE ENERGY</span>
          </span>
          <span className="object-tag tag-right">
            &lt;wear /&gt;<span>IDEAS EN MOVIMIENTO</span>
          </span>
          <div className="hero-product-control">
            <div>
              <span className="dev-label">FEATURED_OBJECT</span>
              <h2>{product.name}</h2>
            </div>
            <div className="object-controls">
              <button
                onClick={() => setIndex((value) => (value + featured.length - 1) % featured.length)}
                aria-label="Prenda anterior"
              >
                <ArrowLeft size={17} />
              </button>
              <span>
                {String(index + 1).padStart(2, '0')}
                <i>/03</i>
              </span>
              <button
                onClick={() => setIndex((value) => (value + 1) % featured.length)}
                aria-label="Prenda siguiente"
              >
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      <div className="dev-hero-bottom">
        <span>
          <span className="live-dot" /> SYSTEM STATUS: <b>CREATING</b>
        </span>
        <button onClick={scroll}>
          SCROLL TO COMPILE <ArrowDown size={14} />
        </button>
        <span>NO TEMPLATES. JUST POSSIBILITIES.</span>
      </div>
    </section>
  );
}
