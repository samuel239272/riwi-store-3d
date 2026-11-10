import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Download, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../components/cart/CartProvider';
import { downloadSelection } from '../services/checkout';
import { formatPrice } from '../utils/format';
import '../styles/cart.css';

export default function CartPage() {
  const { items, count, total, removeItem, updateQuantity, updateVariant } = useCart();
  return (
    <div className="page-width cart-page">
      <Link className="cart-back mono" to="/catalogo">
        <ArrowLeft size={15} /> SEGUIR EXPLORANDO
      </Link>
      <header className="cart-heading">
        <span className="eyebrow">TU PRÓXIMA VERSIÓN / BAG</span>
        <h1>
          Buen código.
          <br />
          Gran selección<span>.</span>
        </h1>
        <p>
          {count
            ? `${count} ${count === 1 ? 'prenda lista' : 'prendas listas'} para tu próximo commit.`
            : 'Tu siguiente prenda favorita todavía está por descubrir.'}
        </p>
      </header>
      {items.length ? (
        <div className="cart-layout">
          <section className="cart-lines" aria-label="Productos en el carrito">
            {items.map((item) => {
              const unitPrice = item.product.promoPrice ?? item.product.price;
              const elsewhere = items
                .filter((other) => other.productId === item.productId && other.key !== item.key)
                .reduce((sum, other) => sum + other.quantity, 0);
              return (
                <article className="cart-line" key={item.key}>
                  <Link className="cart-line-image" to={`/producto/${item.productId}`}>
                    <img
                      src={item.product.images[0]?.src}
                      alt={item.product.images[0]?.alt || item.product.name}
                    />
                  </Link>
                  <div className="cart-line-body">
                    <div className="cart-line-title">
                      <div>
                        <span className="mono">{item.product.collection}</span>
                        <Link to={`/producto/${item.productId}`}>
                          <h2>{item.product.name}</h2>
                        </Link>
                      </div>
                      <button
                        className="cart-remove"
                        aria-label={`Eliminar ${item.product.name}`}
                        onClick={() => removeItem(item.key)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="cart-variant-controls">
                      <label>
                        Talla
                        <select
                          aria-label={`Talla de ${item.product.name}`}
                          value={item.size}
                          onChange={(event) =>
                            updateVariant(item.key, event.target.value, item.color)
                          }
                        >
                          {item.product.sizes.map((size) => (
                            <option key={size}>{size}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Color
                        <select
                          aria-label={`Color de ${item.product.name}`}
                          value={item.color}
                          onChange={(event) =>
                            updateVariant(item.key, item.size, event.target.value)
                          }
                        >
                          {item.product.colors.map((color) => (
                            <option key={color.name}>{color.name}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="cart-line-bottom">
                      <div className="cart-quantity">
                        <button
                          aria-label={`Reducir cantidad de ${item.product.name}`}
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          max={item.product.stock - elsewhere}
                          aria-label={`Cantidad de ${item.product.name}`}
                          value={item.quantity}
                          onChange={(event) => updateQuantity(item.key, Number(event.target.value))}
                        />
                        <button
                          aria-label={`Aumentar cantidad de ${item.product.name}`}
                          disabled={item.quantity + elsewhere >= item.product.stock}
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="cart-line-price">
                        <strong>{formatPrice(unitPrice * item.quantity)}</strong>
                        <small>{formatPrice(unitPrice)} / unidad</small>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
          <aside className="cart-summary">
            <div className="cart-summary-header">
              <span className="mono">RESUMEN.ts</span>
              <span className="cart-summary-dot" />
            </div>
            <h2>Tu selección</h2>
            <dl>
              <div>
                <dt>Productos ({count})</dt>
                <dd>{formatPrice(total)}</dd>
              </div>
              <div>
                <dt>Envío</dt>
                <dd>Por definir</dd>
              </div>
              <div className="cart-summary-total">
                <dt>Subtotal</dt>
                <dd>
                  {formatPrice(total)} <small>COP</small>
                </dd>
              </div>
            </dl>
            <button
              className="button primary cart-download"
              onClick={() => downloadSelection(items)}
            >
              Guardar mi selección <Download size={17} />
            </button>
            <p className="cart-checkout-note">
              Descarga tu lista de prendas. Los pedidos y pagos aún no están habilitados: guardar
              esta selección no realiza una compra ni reserva inventario.
            </p>
            <span className="cart-sample-note mono">CATÁLOGO Y PRECIOS DE MUESTRA</span>
          </aside>
        </div>
      ) : (
        <section className="cart-empty">
          <ShoppingBag size={46} strokeWidth={1} />
          <span className="mono">0 ITEMS · INFINITAS POSIBILIDADES</span>
          <h2>Un espacio para lo que viene.</h2>
          <p>Explora la colección y añade tus prendas favoritas.</p>
          <Link className="button primary" to="/catalogo">
            Explorar colección <ArrowUpRight size={18} />
          </Link>
        </section>
      )}
    </div>
  );
}
