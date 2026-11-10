import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUpRight, Crosshair } from 'lucide-react';
import { assetUrl } from '../../utils/assets';
import { useExperience } from '../digital/Experience';

export function CyberHero() {
  const root = useRef<HTMLElement>(null);
  const { stopped } = useExperience();
  const { scrollYProgress } = useScroll({ target: root, offset: ['start start', 'end start'] });
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 85]);
  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: stopped ? 'instant' : 'smooth' });
  return (
    <section ref={root} className="cyber-hero" aria-labelledby="cyber-hero-title">
      <motion.img
        className="cyber-hero-scene"
        style={{ y: stopped ? 0 : sceneY }}
        src={assetUrl('/media/riwi-cyber-final.webp')}
        alt="La mascota RIWI saluda desde la nave, en un universo tecnológico"
        fetchPriority="high"
      />
      <div className="hero-scene-shade" />
      <div className="hero-reticle" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="cyber-container hero-content">
        <div className="hero-transmission">
          <span>
            <i className="cyber-status-dot" /> A NEW WORLD IS ONLINE
          </span>
          <span>RIWI CYBER / EXPERIENCE 001</span>
        </div>
        <div className="cyber-hero-copy">
          <span className="cyber-eyebrow">MODA PARA MENTES QUE CONSTRUYEN EL FUTURO</span>
          <h1 id="cyber-hero-title">
            CODE YOUR
            <br />
            <span>
              IDENTITY<span className="red-period">.</span>
            </span>
          </h1>
          <p className="hero-manifesto">Be a coder. Change your world.</p>
          <p className="hero-body">
            Lo que imaginas merece salir de la pantalla.
            <br />
            Entra a una nueva dimensión de tu identidad.
          </p>
          <div className="cyber-hero-actions">
            <Link className="cyber-button" to="/catalogo">
              Explorar la colección <ArrowUpRight size={20} />
            </Link>
            <button className="cyber-text-button" onClick={() => scrollTo('riwi-identity')}>
              Conoce nuestro código <ArrowDown size={15} />
            </button>
          </div>
        </div>
        <div className="hero-object-caption">
          <Crosshair size={15} />
          <div>
            THE CREATIVE SPIRIT<span>ARRIVAL COMPLETE / READY TO CREATE</span>
          </div>
        </div>
        <div className="hero-bottom">
          <button onClick={() => scrollTo('cyber-collections')}>
            <span>01 / DISCOVER</span>Un universo. Infinitas versiones.
            <ArrowDown size={18} />
          </button>
          <Link to="/experiencia">
            <span>02 / EXPERIMENT</span>Todo cambia desde otro ángulo.
            <ArrowUpRight size={19} />
          </Link>
          <span className="hero-scroll-label">
            SCROLL TO ENTER <span>↓</span>
          </span>
        </div>
      </div>
    </section>
  );
}
