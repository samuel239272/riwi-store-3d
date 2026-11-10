import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { getProduct } from '../../data/products';
import type { Product } from '../../types/product';
import '../../styles/cart.css';

export const CART_STORAGE_KEY = 'riwi360.cart.v1';
export interface CartLine {
  key: string;
  productId: string;
  size: string;
  color: string;
  quantity: number;
}
export interface CartItem extends CartLine {
  product: Product;
}
interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  notice: string;
  addItem: (productId: string, size: string, color: string, quantity: number) => boolean;
  removeItem: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateVariant: (key: string, size: string, color: string) => void;
  clearCart: () => void;
}
const CartContext = createContext<CartContextValue | null>(null);
const lineKey = (productId: string, size: string, color: string) =>
  JSON.stringify([productId, size, color]);
const validQuantity = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value > 0;

/** Local storage is untrusted; current catalog prices and inventory always win. */
export function sanitizeCart(value: unknown): CartLine[] {
  if (!Array.isArray(value)) return [];
  const result: CartLine[] = [];
  for (const entry of value.slice(0, 200)) {
    if (!entry || typeof entry !== 'object') continue;
    const { productId, size, color, quantity } = entry;
    if (
      typeof productId !== 'string' ||
      typeof size !== 'string' ||
      typeof color !== 'string' ||
      !validQuantity(quantity)
    )
      continue;
    const product = getProduct(productId);
    if (
      !product?.published ||
      !product.sizes.includes(size) ||
      !product.colors.some((option) => option.name === color)
    )
      continue;
    const used = result
      .filter((line) => line.productId === productId)
      .reduce((sum, line) => sum + line.quantity, 0);
    const available = Math.max(0, product.stock - used);
    if (!available) continue;
    const key = lineKey(productId, size, color);
    const existing = result.find((line) => line.key === key);
    const accepted = Math.min(quantity, available);
    if (existing) existing.quantity += accepted;
    else result.push({ key, productId, size, color, quantity: accepted });
  }
  return result;
}
function readCart(): CartLine[] {
  try {
    return sanitizeCart(JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]'));
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readCart);
  const current = useRef(lines);
  const [notice, setNotice] = useState('');
  const [announcement, setAnnouncement] = useState(0);
  const announce = (message: string) => {
    setNotice(message);
    setAnnouncement((value) => value + 1);
  };
  const replace = (next: CartLine[]) => {
    current.current = next;
    setLines(next);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next));
    } catch {
      announce(
        'Tu selección se conserva en esta sesión. El navegador no permite guardarla para después.',
      );
    }
  };
  useEffect(() => {
    const timeout = window.setTimeout(() => setNotice(''), 5500);
    return () => window.clearTimeout(timeout);
  }, [announcement]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
      const next = readCart();
      current.current = next;
      setLines(next);
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const items: CartItem[] = lines.flatMap((line) => {
    const product = getProduct(line.productId);
    return product?.published ? [{ ...line, product }] : [];
  });
  const addItem = (productId: string, size: string, color: string, quantity: number) => {
    const product = getProduct(productId);
    if (
      !product?.published ||
      !product.sizes.includes(size) ||
      !product.colors.some((option) => option.name === color) ||
      !validQuantity(quantity)
    ) {
      announce('Selecciona una talla, un color y una cantidad válidos.');
      return false;
    }
    const used = current.current
      .filter((line) => line.productId === productId)
      .reduce((sum, line) => sum + line.quantity, 0);
    if (used + quantity > product.stock) {
      announce(
        `Puedes añadir ${Math.max(0, product.stock - used)} unidades más de ${product.name}.`,
      );
      return false;
    }
    const key = lineKey(productId, size, color);
    const existing = current.current.find((line) => line.key === key);
    replace(
      existing
        ? current.current.map((line) =>
            line.key === key ? { ...line, quantity: line.quantity + quantity } : line,
          )
        : [...current.current, { key, productId, size, color, quantity }],
    );
    announce(`${product.name} añadido a tu selección.`);
    return true;
  };
  const removeItem = (key: string) => {
    replace(current.current.filter((line) => line.key !== key));
    announce('Producto eliminado de tu selección.');
  };
  const updateQuantity = (key: string, quantity: number) => {
    const selected = current.current.find((line) => line.key === key);
    if (!selected) return;
    if (quantity === 0) {
      removeItem(key);
      return;
    }
    if (!validQuantity(quantity)) {
      announce('Introduce una cantidad entera mayor que cero.');
      return;
    }
    const product = getProduct(selected.productId);
    if (!product) return;
    const elsewhere = current.current
      .filter((line) => line.productId === selected.productId && line.key !== key)
      .reduce((sum, line) => sum + line.quantity, 0);
    const available = Math.max(0, product.stock - elsewhere);
    if (quantity > available) {
      announce(`El máximo disponible para esta selección es ${available}.`);
      return;
    }
    replace(current.current.map((line) => (line.key === key ? { ...line, quantity } : line)));
    announce('Cantidad actualizada.');
  };
  const updateVariant = (key: string, size: string, color: string) => {
    const selected = current.current.find((line) => line.key === key);
    const product = selected && getProduct(selected.productId);
    if (
      !selected ||
      !product ||
      !product.sizes.includes(size) ||
      !product.colors.some((option) => option.name === color)
    )
      return;
    const nextKey = lineKey(selected.productId, size, color);
    if (nextKey === key) return;
    const remaining = current.current.filter((line) => line.key !== key);
    const duplicate = remaining.find((line) => line.key === nextKey);
    replace(
      duplicate
        ? remaining.map((line) =>
            line.key === nextKey ? { ...line, quantity: line.quantity + selected.quantity } : line,
          )
        : [...remaining, { ...selected, key: nextKey, size, color }],
    );
    announce('Talla y color actualizados.');
  };
  const total = items.reduce(
    (sum, item) => sum + (item.product.promoPrice ?? item.product.price) * item.quantity,
    0,
  );
  return (
    <CartContext.Provider
      value={{
        items,
        count: items.reduce((sum, item) => sum + item.quantity, 0),
        total,
        notice,
        addItem,
        removeItem,
        updateQuantity,
        updateVariant,
        clearCart: () => {
          replace([]);
          announce('Tu selección está vacía.');
        },
      }}
    >
      {children}
      <div
        className={`cart-announcement${notice ? ' is-visible' : ''}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {notice}
      </div>
    </CartContext.Provider>
  );
}
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart requires CartProvider');
  return context;
}
