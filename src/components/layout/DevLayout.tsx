import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Menu,
  X,
  ShoppingBag,
  Search,
  Command,
  Pause,
  Play,
  ArrowRight,
  CornerDownLeft,
  GitBranch,
} from 'lucide-react';
import { motion, useScroll } from 'framer-motion';
import { useCart } from '../cart/CartProvider';
import { useExperience } from '../digital/Experience';
import { Modal } from '../ui/Modal';
import { assetUrl } from '../../utils/assets';
import { products } from '../../data/products';

export function Brand() {
  return (
    <Link to="/" className="dev-brand" aria-label="RIWI 360°, inicio">
      <span className="dev-brand-image">
        <img src={assetUrl('/logos/riwi-coder.png')} alt="RIWI" width="112" height="40" />
      </span>
      <span className="dev-brand-divider" />
      <span className="dev-brand-edition">
        DEVWEAR<small>360° / CREATIVE UNIFORM</small>
      </span>
    </Link>
  );
}

function CommandPalette({ close }: { close: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const results = products
    .filter(
      (product) => product.published && product.name.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 5);
  const go = (route: string) => {
    close();
    navigate(route);
  };
  useEffect(() => {
    input.current?.focus();
  }, []);
  return (
    <Modal title="Consola de exploración" onClose={close} className="command-dialog">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          go(`/catalogo?q=${encodeURIComponent(query)}`);
        }}
      >
        <label className="command-input">
          <Search size={21} />
          <input
            ref={input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="¿Qué quieres explorar?"
            aria-label="Buscar en la tienda"
          />
          <kbd>ESC</kbd>
        </label>
      </form>
      <div className="command-results">
        <span className="dev-label">{query ? 'ARCHIVOS ENCONTRADOS' : 'ACCESO RÁPIDO'}</span>
        {!query && (
          <>
            <button onClick={() => go('/catalogo')}>
              <span>01 /</span> Explorar toda la colección <ArrowUpRight size={17} />
            </button>
            <button onClick={() => go('/experiencia')}>
              <span>02 /</span> Abrir el estudio 360° <ArrowUpRight size={17} />
            </button>
            <button onClick={() => go('/probador')}>
              <span>03 /</span> Crear mi versión digital <ArrowUpRight size={17} />
            </button>
          </>
        )}
        {query &&
          results.map((product) => (
            <button key={product.id} onClick={() => go(`/producto/${product.id}`)}>
              <img src={product.images[0].src} alt="" />
              {product.name}
              <ArrowUpRight size={17} />
            </button>
          ))}
        {query && !results.length && (
          <p>No encontramos esa prenda. Prueba con “hoodie” o “camiseta”.</p>
        )}
      </div>
      <div className="command-foot">
        <CornerDownLeft size={12} /> ENTER para buscar en el catálogo
      </div>
    </Modal>
  );
}

function Shell() {
  const [menu, setMenu] = useState(false);
  const [command, setCommand] = useState(false);
  const { count, notice } = useCart();
  const { stopped, systemReduced, toggleMotion } = useExperience();
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
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommand((value) => !value);
      }
      if (event.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  return (
    <div className="dev-shell">
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
        className="reading-progress"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />
      <aside className="dev-rail" aria-hidden="true">
        <span>+</span>
        <span>RIWI / INDEPENDENT CREATIVE CULTURE</span>
        <span>© {new Date().getFullYear()}</span>
      </aside>
      <header className="site-header dev-header">
        <div className="header-inner page-width">
          <Brand />
          <nav
            id="main-navigation"
            className={`main-nav ${menu ? 'open' : ''}`}
            aria-label="Navegación principal"
          >
            <NavLink to="/" end>
              <span>00</span> Inicio
            </NavLink>
            <NavLink to="/catalogo">
              <span>01</span> Explorar tienda
            </NavLink>
            <NavLink to="/colecciones">
              <span>02</span> Colecciones
            </NavLink>
            <NavLink to="/experiencia">
              <span>03</span> Estudio 360°
            </NavLink>
            <NavLink to="/probador">
              <span>04</span> Probador virtual
            </NavLink>
          </nav>
          <div className="header-actions">
            <button
              className="command-trigger"
              onClick={() => setCommand(true)}
              aria-label="Abrir búsqueda y comandos"
            >
              <Search size={16} />
              <kbd>⌘ K</kbd>
            </button>
            <button
              className="motion-toggle"
              onClick={toggleMotion}
              disabled={systemReduced}
              title={systemReduced ? 'Movimiento reducido según la preferencia de tu dispositivo' : undefined}
              aria-label={systemReduced ? 'Movimiento reducido activado' : stopped ? 'Activar animaciones' : 'Pausar animaciones'}
              aria-pressed={stopped}
            >
              {stopped ? <Play size={14} /> : <Pause size={14} />}
            </button>
            <Link to="/carrito" className="dev-cart" aria-label={`Carrito, ${count} artículos`}>
              <ShoppingBag size={18} />
              <span>{String(count).padStart(2, '0')}</span>
            </Link>
            <button
              type="button"
              className="icon-button mobile-menu"
              aria-controls="main-navigation"
              aria-expanded={menu}
              aria-label={menu ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <div className="cart-notice" role="status" aria-live="polite">
        {notice}
      </div>
      <footer className="dev-footer">
        <div className="page-width">
          <div className="footer-prelude">
            <span className="dev-label">
              <GitBranch size={13} /> THE NEXT COMMIT IS YOURS
            </span>
            <span>IDEAS → CODE → CULTURE</span>
          </div>
          <div className="footer-statement">
            <h2>
              BUILD YOUR
              <br />
              <span>OWN WORLD.</span>
            </h2>
            <Link to="/catalogo" className="footer-orb" aria-label="Explorar la colección">
              <ArrowUpRight strokeWidth={1} size={65} />
            </Link>
          </div>
          <div className="dev-footer-grid">
            <div>
              <Brand />
              <p>
                Una comunidad que escribe el futuro.
                <br />
                Una forma de llevarlo puesto.
              </p>
            </div>
            <div>
              <span className="dev-label">DIRECTORIO</span>
              <Link to="/catalogo">
                Todas las prendas <ArrowUpRight size={14} />
              </Link>
              <Link to="/colecciones">
                Colecciones <ArrowUpRight size={14} />
              </Link>
            </div>
            <div>
              <span className="dev-label">LABORATORIO</span>
              <Link to="/experiencia">
                Estudio 360° <ArrowUpRight size={14} />
              </Link>
              <Link to="/probador">
                Probador virtual <ArrowUpRight size={14} />
              </Link>
            </div>
            <button className="footer-command" onClick={() => setCommand(true)}>
              <Command size={22} />
              <span>
                ENCUENTRA TU PRÓXIMA IDEA
                <small>
                  Abrir consola de exploración <ArrowRight size={13} />
                </small>
              </span>
            </button>
          </div>
          <div className="dev-footer-bottom">
            <span>© {new Date().getFullYear()} RIWI 360°</span>
            <span>Catálogo conceptual · Pagos aún no habilitados</span>
            <span>
              <i className="live-dot" /> ALWAYS IN DEVELOPMENT
            </span>
          </div>
        </div>
      </footer>
      {command && <CommandPalette close={() => setCommand(false)} />}
    </div>
  );
}

export function Layout() {
  return <Shell />;
}
