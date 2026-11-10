import { Suspense, useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Code2,
  Menu,
  Pause,
  Play,
  RotateCcw,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react';
import { motion, useScroll } from 'framer-motion';
import { useReborn } from '../reborn/RebornExperience';
import { useExperience } from '../digital/Experience';
import { useCart } from '../cart/CartProvider';
import { CommandPalette } from '../cyber/CommandPalette';
import { assetUrl } from '../../utils/assets';

const sections = [
  { id: 'system-online', label: 'Universo' },
  { id: 'select-loadout', label: 'Loadout' },
  { id: 'code-collection', label: 'Drop 001' },
  { id: 'built-by-coders', label: 'Terminal' },
];
export function RebornBrand() {
  const { stopped } = useExperience();
  return (
    <Link
      className="cyber-brand reborn-brand"
      to="/"
      aria-label="RIWI System Reborn, inicio"
      onClick={(event) => {
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey && event.button === 0)
          window.scrollTo({ top: 0, behavior: stopped ? 'instant' : 'smooth' });
      }}
    >
      <span className="official-logo">
        <img src={assetUrl('/logos/riwi-coder.png')} width="94" height="45" alt="RIWI" />
      </span>
      <span className="reborn-brand-name">
        SYSTEM
        <br />
        <b>
          REBORN<span>_</span>
        </b>
      </span>
    </Link>
  );
}
export function Layout() {
  const [menu, setMenu] = useState(false);
  const [command, setCommand] = useState(false);
  const [active, setActive] = useState('system-online');
  const { state, ready, replay } = useReborn();
  const { stopped, systemReduced, toggleMotion } = useExperience();
  const { count, notice } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const go = (id: string) => {
    setMenu(false);
    setActive(id);
    if (location.pathname === '/')
      document.getElementById(id)?.scrollIntoView({ behavior: stopped ? 'instant' : 'smooth' });
    else navigate('/', { state: { section: id } });
  };
  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (location.pathname !== '/')
      document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [location.pathname]);
  useEffect(() => {
    if (location.pathname !== '/' || !ready) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        }),
      { rootMargin: '-18% 0px -55% 0px' },
    );
    sections.forEach((section) => {
      const node = document.getElementById(section.id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [location.pathname, ready]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (state === 'BOOT' || state === 'INTRO_PLAYING') return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommand((value) => !value);
      }
      if (event.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [state]);
  return (
    <div className={`cyber-shell reborn-shell ${location.pathname === '/' ? 'is-home' : ''}`}>
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
        className="reborn-reading-progress"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />
      <header className="cyber-header reborn-header">
        <RebornBrand />
        <nav
          className={`reborn-nav ${menu ? 'is-open' : ''}`}
          id="main-navigation"
          aria-label="Navegación principal"
        >
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => go(section.id)}
              aria-current={
                location.pathname === '/' && active === section.id ? 'location' : undefined
              }
            >
              {section.label}
            </button>
          ))}
          <Link to="/experiencia" aria-label="Estudio 360°">
            Estudio <span>3D</span>
          </Link>
          <Link to="/probador">Probador virtual</Link>
        </nav>
        <div className="reborn-header-actions">
          <button
            className="reborn-search"
            onClick={() => setCommand(true)}
            aria-label="Abrir búsqueda y comandos"
          >
            <Search size={18} />
            <kbd>Ctrl K</kbd>
          </button>
          <button
            className="reborn-motion"
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
          <Link className="reborn-bag" to="/carrito" aria-label={`Carrito, ${count} artículos`}>
            <ShoppingBag size={17} />
            <span>{String(count).padStart(2, '0')}</span>
          </Link>
          <button
            className="reborn-menu"
            onClick={() => setMenu((value) => !value)}
            aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menu}
            aria-controls="main-navigation"
          >
            {menu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="page-loading" role="status">
              Preparing your next world...
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <div className="cart-notice" role="status" aria-live="polite">
        {notice}
      </div>
      <footer className="reborn-footer">
        <div className="reborn-container">
          <div className="reborn-footer-grid">
            <div>
              <RebornBrand />
              <p>Be a coder. Change your world.</p>
            </div>
            <div className="reborn-footer-links">
              <Link to="/catalogo">
                Explorar colección <ArrowUpRight size={13} />
              </Link>
              <Link to="/experiencia">
                Estudio 360° <ArrowUpRight size={13} />
              </Link>
              <Link to="/probador">
                Probador virtual <ArrowUpRight size={13} />
              </Link>
              <a href={assetUrl('/tech/ATTRIBUTION.txt')} target="_blank" rel="noreferrer">
                Créditos visuales <ArrowUpRight size={13} />
              </a>
            </div>
            <button className="reborn-replay" onClick={replay}>
              <RotateCcw size={19} />
              <span>
                REPLAY ARRIVAL<small>Volver al origen</small>
              </span>
            </button>
          </div>
          <div className="reborn-footer-bottom">
            <span>© {new Date().getFullYear()} RIWI / SYSTEM REBORN</span>
            <span>Catálogo demostrativo. Selección local. Pagos no habilitados.</span>
            <Code2 size={17} />
          </div>
        </div>
      </footer>
      <aside className="mascot-rail" aria-hidden="true">
        <span>RIWI / HUMAN CREATIVITY</span>
        <i />
        <span>ALWAYS ONLINE</span>
      </aside>
      {command && <CommandPalette close={() => setCommand(false)} />}
    </div>
  );
}
