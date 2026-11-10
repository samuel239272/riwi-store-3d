import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Search,
  Pause,
  Play,
  ShoppingBag,
  RotateCcw,
  Code2,
} from 'lucide-react';
import { motion, useScroll } from 'framer-motion';
import { useCart } from '../cart/CartProvider';
import { useExperience } from '../digital/Experience';
import { useCinema } from '../cyber/CinematicExperience';
import { CommandPalette } from '../cyber/CommandPalette';
import { assetUrl } from '../../utils/assets';

export function CyberBrand() {
  return (
    <Link to="/" className="cyber-brand" aria-label="RIWI CYBER, inicio">
      <span className="official-logo">
        <img src={assetUrl('/logos/riwi-coder.png')} width="112" height="42" alt="RIWI" />
      </span>
      <span className="brand-cyber">
        CYBER<small>CODE YOUR IDENTITY</small>
      </span>
    </Link>
  );
}

export function Layout() {
  const [menu, setMenu] = useState(false);
  const [command, setCommand] = useState(false);
  const { count, notice } = useCart();
  const { stopped, systemReduced, toggleMotion } = useExperience();
  const { replay, phase } = useCinema();
  const location = useLocation();
  const { scrollYProgress } = useScroll();
  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (location.pathname !== '/')
      document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location.pathname]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (phase === 'intro') return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommand((value) => !value);
      }
      if (event.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [phase]);
  return (
    <div className={`cyber-shell ${location.pathname === '/' ? 'is-home' : ''}`}>
      <a
        href="#main-content"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Saltar al contenido
      </a>
      <motion.div
        className="cyber-reading-progress"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />
      <header className="cyber-header">
        <CyberBrand />
        <nav
          id="main-navigation"
          className={menu ? 'cyber-nav is-open' : 'cyber-nav'}
          aria-label="Navegación principal"
        >
          <NavLink to="/" end>
            Universo
          </NavLink>
          <NavLink to="/catalogo" aria-label="Explorar tienda">
            Colección
          </NavLink>
          <NavLink to="/colecciones">Drops</NavLink>
          <NavLink to="/experiencia" aria-label="Estudio 360°">
            Showroom <span>3D</span>
          </NavLink>
          <NavLink to="/probador">Probador virtual</NavLink>
        </nav>
        <div className="cyber-header-actions">
          <button
            onClick={() => setCommand(true)}
            className="cyber-search"
            aria-label="Abrir búsqueda y comandos"
          >
            <Search size={18} />
            <kbd>Ctrl K</kbd>
          </button>
          <button
            className="cyber-motion"
            onClick={toggleMotion}
            disabled={systemReduced}
            aria-label={
              systemReduced
                ? 'Movimiento reducido activado'
                : stopped
                  ? 'Activar animaciones'
                  : 'Pausar animaciones'
            }
            aria-pressed={stopped}
          >
            {stopped ? <Play size={15} /> : <Pause size={15} />}
          </button>
          <Link className="cyber-bag" to="/carrito" aria-label={`Carrito, ${count} artículos`}>
            <ShoppingBag size={18} />
            <span>{String(count).padStart(2, '0')}</span>
          </Link>
          <button
            className="cyber-menu-button"
            onClick={() => setMenu((value) => !value)}
            aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menu}
            aria-controls="main-navigation"
          >
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="page-loading" role="status">
              Compilando tu experiencia...
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <div className="cart-notice" role="status" aria-live="polite">
        {notice}
      </div>
      <footer className="cyber-footer">
        <div className="cyber-container">
          <div className="cyber-footer-top">
            <span className="cyber-eyebrow">TRANSMISSION COMPLETE / YOUR STORY STARTS HERE</span>
            <Code2 size={22} />
          </div>
          <div className="cyber-footer-title">
            <h2>
              CODE YOUR
              <br />
              <span>IDENTITY.</span>
            </h2>
            <Link className="cyber-round-link" to="/catalogo" aria-label="Explorar la colección">
              <ArrowUpRight size={58} strokeWidth={1} />
            </Link>
          </div>
          <div className="cyber-footer-grid">
            <div>
              <CyberBrand />
              <p>
                Be a coder. Change your world.
                <br />
                El siguiente capítulo lleva tu nombre.
              </p>
            </div>
            <div>
              <span className="cyber-eyebrow">EXPLORAR</span>
              <Link to="/catalogo">
                Toda la colección <ArrowUpRight size={14} />
              </Link>
              <Link to="/colecciones">
                Los drops <ArrowUpRight size={14} />
              </Link>
            </div>
            <div>
              <span className="cyber-eyebrow">EXPERIMENTAR</span>
              <Link to="/experiencia">
                Showroom 360° <ArrowUpRight size={14} />
              </Link>
              <Link to="/probador">
                Tu versión digital <ArrowUpRight size={14} />
              </Link>
            </div>
            <button className="cinema-replay" onClick={replay}>
              <RotateCcw size={21} />
              <span>
                VOLVER AL ORIGEN
                <small>
                  Reproducir la introducción <ArrowRight size={14} />
                </small>
              </span>
            </button>
          </div>
          <div className="cyber-footer-bottom">
            <span>© {new Date().getFullYear()} RIWI CYBER</span>
            <span>Colección conceptual · Datos de demostración · Pagos no habilitados</span>
            <span>
              <i className="cyber-status-dot" /> HUMAN CREATIVITY. ALWAYS ON.
            </span>
          </div>
        </div>
      </footer>
      {command && <CommandPalette close={() => setCommand(false)} />}
    </div>
  );
}
