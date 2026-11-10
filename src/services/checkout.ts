import type { CartItem } from '../components/cart/CartProvider';
import { formatPrice } from '../utils/format';

/** Future checkout adapters must validate price and stock on the server. */
export interface CheckoutRequest {
  items: { productId: string; size: string; color: string; quantity: number }[];
  customerId?: string;
  coupon?: string;
}
export interface CheckoutSession {
  id: string;
  redirectUrl: string;
}
export interface CheckoutGateway {
  createSession: (request: CheckoutRequest) => Promise<CheckoutSession>;
}
export const checkoutAvailability = {
  enabled: false,
  reason: 'Los pagos y los pedidos todavía no están habilitados.',
} as const;

export function selectionSummary(items: CartItem[]): string {
  const total = items.reduce(
    (sum, line) => sum + (line.product.promoPrice ?? line.product.price) * line.quantity,
    0,
  );
  return [
    'RIWI 360° — Mi selección',
    'Lista de productos de muestra. No constituye un pedido, una reserva ni un comprobante de pago.',
    'Precios e inventario provisionales; no se han calculado envío ni impuestos adicionales.',
    '',
    ...items.map(
      (line) =>
        `${line.product.name} | ${line.product.reference} | Talla ${line.size} | ${line.color} | ${line.quantity} × ${formatPrice(line.product.promoPrice ?? line.product.price)} = ${formatPrice((line.product.promoPrice ?? line.product.price) * line.quantity)}`,
    ),
    '',
    `Subtotal de productos: ${formatPrice(total)}`,
  ].join('\n');
}

export function downloadSelection(items: CartItem[]) {
  const url = URL.createObjectURL(
    new Blob([selectionSummary(items)], { type: 'text/plain;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'riwi-360-mi-seleccion.txt';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
