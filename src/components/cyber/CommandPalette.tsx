import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, CornerDownLeft, Search } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { products } from '../../data/products';

export function CommandPalette({ close }: { close: () => void }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const input = useRef<HTMLInputElement>(null);
  const go = (route: string) => {
    close();
    navigate(route);
  };
  const results = products
    .filter(
      (product) =>
        product.published &&
        `${product.name} ${product.reference}`.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 5);
  useEffect(() => {
    input.current?.focus();
  }, []);
  return (
    <Modal title="Consola de exploración" className="cyber-command" onClose={close}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          go(`/catalogo?q=${encodeURIComponent(query)}`);
        }}
      >
        <label className="cyber-command-input">
          <Search size={20} />
          <input
            ref={input}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Buscar en la tienda"
            placeholder="Encuentra tu próxima versión..."
          />
          <kbd>ESC</kbd>
        </label>
      </form>
      <div className="cyber-command-results">
        <span className="cyber-eyebrow">{query ? 'RESULTADOS' : 'ACCESO DIRECTO'}</span>
        {!query && (
          <>
            {[
              ['/catalogo', 'Explorar la colección'],
              ['/experiencia', 'Abrir el estudio 360°'],
              ['/probador', 'Crear mi versión digital'],
            ].map(([route, label]) => (
              <button onClick={() => go(route)} key={route}>
                {label}
                <ArrowUpRight size={18} />
              </button>
            ))}
          </>
        )}
        {query &&
          results.map((product) => (
            <button onClick={() => go(`/producto/${product.id}`)} key={product.id}>
              <img src={product.images[0].src} alt="" />
              {product.name}
              <ArrowUpRight size={18} />
            </button>
          ))}
        {query && !results.length && (
          <p>Ese archivo aún no existe. Prueba con “hoodie” o “camiseta”.</p>
        )}
      </div>
      <div className="cyber-command-foot">
        <CornerDownLeft size={12} /> ENTER para buscar en todo el catálogo
      </div>
    </Modal>
  );
}
