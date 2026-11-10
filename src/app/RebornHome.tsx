import { useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { ArrowDown, ArrowRight, ArrowUpRight, Boxes, Code2, Fingerprint } from 'lucide-react';
import { GlassPanel } from '../components/reborn/GlassPanel';
import { FeaturedSection } from '../components/reborn/FeaturedSection';
import { CyberTerminal } from '../components/reborn/CyberTerminal';
import { Reveal, ParallaxImage } from '../components/reborn/ScrollReveal';
import { useExperience } from '../components/digital/Experience';
import { usePageMeta } from '../hooks/usePageMeta';
import { products } from '../data/products';

export default function RebornHome() {
  usePageMeta(
    'WEAR THE FUTURE',
    'RIWI — System Reborn. Moda, código y una nueva realidad. Explora Drop 001, descubre Tech Orbit y programa tu próxima identidad.',
  );
  const { stopped } = useExperience();
  const hero = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: hero, offset: ['start start', 'end start'] });
  const scrollDepth = useSpring(scrollYProgress, { stiffness: 180, damping: 35 });
  const heroY = useTransform(scrollDepth, [0, 1], [0, -72]);
  const heroOpacity = useTransform(scrollDepth, [0, 0.45, 0.95], [1, 1, 0]);
  const location = useLocation();
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: stopped ? 'instant' : 'smooth' });
  useEffect(() => {
    const id = (location.state as { section?: string } | null)?.section;
    if (id) {
      const frame = requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'instant' }),
      );
      return () => cancelAnimationFrame(frame);
    }
  }, [location.state]);
  return (
    <div className="reborn-home">
      <section ref={hero} className="reborn-hero" id="system-online">
        <div className="hero-system-grid" aria-hidden="true" />
        <div className="reborn-hero-inner">
          <div className="system-transmission">
            <span>
              <i className="system-live-dot" /> SYSTEM REBORN / ONLINE
            </span>
            <span>HUMAN CREATIVITY / v.001</span>
          </div>
          <motion.div
            className="reborn-hero-copy"
            style={{ y: stopped ? 0 : heroY, opacity: stopped ? 1 : heroOpacity }}
          >
            <span className="system-eyebrow">EL FUTURO SE PROGRAMA. EL ESTILO SE LLEVA.</span>
            <h1>
              <span className="hero-title-line hero-title-wear">
                <span>WEAR</span>
              </span>
              <span className="hero-title-line hero-title-future">
                <span>
                  THE FUTURE<span className="violet-period">.</span>
                </span>
              </span>
            </h1>
            <p>
              El futuro lo construyen
              <br />
              quienes se atreven a programarlo.
            </p>
            <div className="reborn-hero-actions">
              <button className="system-button" onClick={() => scrollTo('select-loadout')}>
                EXPLORE DROP 001 <ArrowUpRight size={19} />
              </button>
              <span>
                BUILT BY CODERS.
                <br />
                <b>WORN BY CREATORS.</b>
              </span>
            </div>
            <span className="hero-source-signature">
              <Code2 size={20} />
              {'const next = you.create();'}
            </span>
          </motion.div>
          <div className="reborn-hero-bottom">
            <button onClick={() => scrollTo('select-loadout')}>
              <span>SCROLL TO REBUILD</span>
              <ArrowDown size={15} />
            </button>
            <span>BE A CODER. CHANGE YOUR WORLD.</span>
          </div>
        </div>
      </section>
      <section
        className="reborn-section loadout-section"
        id="select-loadout"
        data-source="loadout.config.ts"
      >
        <div className="reborn-container">
          <Reveal className="reborn-section-heading">
            <span className="system-eyebrow">01 / SELECT YOUR LOADOUT</span>
            <h2>
              YOUR WORLD.
              <br />
              <em>YOUR RULES.</em>
            </h2>
            <p>
              El uniforme de quienes construyen
              <br />
              lo que todavía no existe.
            </p>
          </Reveal>
          <div className="loadout-editorial">
            {[
              {
                category: 'hoodies',
                name: 'HOODIES',
                code: '01',
                text: 'Ideas grandes. Sin límites.',
                product: products[0],
                icon: Boxes,
              },
              {
                category: 'camisetas',
                name: 'T-SHIRTS',
                code: '02',
                text: 'Tu código fuente. A la vista.',
                product: products[1],
                icon: Code2,
              },
              {
                category: 'accesorios',
                name: 'ACCESSORIES',
                code: '03',
                text: 'Cada detalle dice quién eres.',
                product: products[7],
                icon: Fingerprint,
              },
            ].map((item, index) => (
              <Reveal
                key={item.category}
                className={`loadout-wrap loadout-${item.code}`}
                delay={index * 0.09}
              >
                <Link to={`/catalogo?categoria=${item.category}`} className="loadout-link">
                  <GlassPanel variant="product" className="loadout-card">
                    <div className="loadout-card-head">
                      <span>
                        {item.code} / ~/loadout/{item.category}
                      </span>
                      <item.icon size={17} />
                    </div>
                    <ParallaxImage
                      src={item.product.images[0].src}
                      alt={item.product.images[0].alt}
                      loading="lazy"
                      width="900"
                      height="1000"
                    />
                    <div className="loadout-card-copy">
                      <h3>{item.name}</h3>
                      <p>{item.text}</p>
                      <span>
                        EXPLORAR <ArrowUpRight size={17} />
                      </span>
                    </div>
                    <span className="loadout-big-code" aria-hidden="true">
                      {item.code}
                    </span>
                  </GlassPanel>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <FeaturedSection />
      <CyberTerminal />
      <section
        className="reborn-section reborn-finale"
        id="deploy-identity"
        data-source="future.deploy.ts"
      >
        <div className="reborn-container">
          <Reveal kind="finale">
            <span className="system-eyebrow">04 / DEPLOY YOUR IDENTITY</span>
            <h2>
              THE NEXT
              <br />
              GENERATION
              <br />
              <em>IS HERE.</em>
            </h2>
            <p>
              No esperes una nueva realidad.
              <br />
              Construye la tuya.
            </p>
            <Link className="system-button" to="/catalogo">
              EXPLORE THE COLLECTION <ArrowRight size={20} />
            </Link>
            <div className="finale-code">
              <span>BUILD SUCCESSFUL</span>
              <i className="system-live-dot" />
              <code>{'your.future.deploy()'}</code>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
