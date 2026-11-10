import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  Code2,
  Crosshair,
  GitBranch,
  Sparkles,
  Terminal,
  Ticket,
} from 'lucide-react';
import { useRewards } from './RewardsProvider';

export function DeveloperWorkspace() {
  const { pathname } = useLocation();
  const { earned, completed } = useRewards();
  const [focused, setFocused] = useState(() => {
    try {
      return localStorage.getItem('riwi-focus-mode') === 'true';
    } catch {
      return false;
    }
  });
  useEffect(() => {
    document.documentElement.dataset.focusMode = String(focused);
    try {
      localStorage.setItem('riwi-focus-mode', String(focused));
    } catch {
      /* Session preference remains usable. */
    }
    return () => {
      delete document.documentElement.dataset.focusMode;
    };
  }, [focused]);
  const file =
    pathname === '/'
      ? 'welcome'
      : pathname.startsWith('/producto')
        ? 'producto'
        : pathname.slice(1);
  return (
    <div className="developer-workspace">
      <div className="workspace-location">
        <GitBranch size={14} />
        <span>riwi /</span>
        <strong>{file}.tsx</strong>
      </div>
      <nav aria-label="Herramientas del desarrollador">
        <Link to="/catalogo" aria-current={pathname === '/catalogo' ? 'page' : undefined}>
          <Code2 size={14} />
          Colección
        </Link>
        <Link to="/retos" aria-current={pathname === '/retos' ? 'page' : undefined}>
          <Terminal size={14} />
          Code Arcade <span className="workspace-count">{completed.length}/12</span>
        </Link>
        <Link to="/retos#recompensas" aria-label={`Mis recompensas, ${earned.length} códigos`}>
          <Ticket size={14} />
          <span>{earned.length}</span>
        </Link>
        <button
          onClick={() => setFocused(!focused)}
          aria-pressed={focused}
          aria-label="Modo concentración"
          title="Reduce la ambientación para concentrarte"
        >
          <Crosshair size={15} />
          <span>Focus</span>
        </button>
      </nav>
    </div>
  );
}

export function CodingGateway() {
  const { completed } = useRewards();
  return (
    <section className="coding-gateway reborn-container" aria-labelledby="coding-gateway-title">
      <div className="gateway-copy">
        <span className="arena-kicker">
          <Sparkles size={14} /> NUEVO / CODE TO REWARD
        </span>
        <h2 id="coding-gateway-title">
          Tu próximo descuento
          <br />
          <em>lo escribes tú.</em>
        </h2>
        <p>
          ¡Obtén códigos de descuento codificando! Dos juegos, doce niveles y muchas primeras veces.
          No necesitas experiencia: empieza con un hello.
        </p>
        <Link className="dev-primary" to="/retos">
          {completed.length ? 'Continuar mi aventura' : 'Empezar a codificar'}{' '}
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
        <small>{completed.length}/12 niveles completados · Hasta 15 % de descuento</small>
      </div>
      <div className="gateway-terminal">
        <div className="editor-tab">
          <span className="window-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          your-next-level.js
        </div>
        <div className="gateway-code">
          <span className="code-comment">// Tus ideas valen más de lo que crees.</span>
          <p>
            <span>const</span> developer = <b>"tú"</b>;
          </p>
          <p>
            <span>while</span> (curiosity) {'{'}
          </p>
          <p className="indented">learn();</p>
          <p className="indented">
            unlock(<b>"recompensas"</b>);
          </p>
          <p>{'}'}</p>
          <div className="gateway-result">
            <CheckMark />
            Tu primer reto te espera
            <span className="terminal-caret" aria-hidden="true">
              ▌
            </span>
          </div>
        </div>
        <div className="gateway-mini-links">
          <Link to="/retos?juego=debug">
            01 · Debug Quest <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
          <Link to="/retos?juego=pipeline">
            02 · Build Pipeline <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function StoreRewardBanner() {
  const { earned, active } = useRewards();
  const best = earned.reduce((max, reward) => Math.max(max, reward.percent), 0);
  return (
    <aside className="store-reward-banner" aria-label="Recompensas por programar">
      <span className="store-reward-icon">
        <Ticket size={22} />
      </span>
      <div>
        <strong>
          {active
            ? `${active.percent} % de descuento listo en tu carrito.`
            : best
              ? `Ya ganaste hasta un ${best} % de descuento.`
              : 'Tu próximo descuento empieza con una línea.'}
        </strong>
        <p>
          {active
            ? `Código ${active.code} · Se aplicará a tu selección.`
            : 'Aprende jugando en Code Arcade y desbloquea una recompensa en cada nivel.'}
        </p>
      </div>
      <Link to={earned.length ? '/retos#recompensas' : '/retos'}>
        {earned.length ? 'Ver mis códigos' : 'Codifica y gana'}{' '}
        <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </aside>
  );
}
function CheckMark() {
  return (
    <span className="gateway-check" aria-hidden="true">
      ✓
    </span>
  );
}
