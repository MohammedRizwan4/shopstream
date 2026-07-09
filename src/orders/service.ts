import { err, ok, type Result } from '../shared/result.js';
import { nextId } from '../shared/ids.js';
import { money } from '../shared/money.js';
import type { Clock } from '../shared/clock.js';
import type { UserRepo } from '../users/repo.js';
import type { Cart } from '../cart/cart.js';
import type { StockLedger } from '../inventory/stock.js';
import { applyPromoCode } from '../pricing/calc.js';
import { canTransition, type Order, type OrderStatus } from './model.js';
import { reserveStockFor } from './stock-check.js';
import type { OrderRepo } from './repo.js';

export class OrderService {
  constructor(
    private readonly repo: OrderRepo,
    private readonly users: UserRepo,
    private readonly clock: Clock,
  ) {}

  placeFromCart(cart: Cart, promoCode?: string, ledger?: StockLedger): Result<Order> {
    const priced = cart.priced();
    if (priced.length === 0) return err('order/empty-cart', 'nothing to order');
    if (!this.users.byId(cart.userId)) return err('order/unknown-user', cart.userId);

    const subtotal = cart.subtotal();
    const discount = promoCode
      ? applyPromoCode(subtotal, promoCode, this.clock.now())
      : money(0, subtotal.currency);

    const order: Order = {
      id: nextId('ord'),
      userId: cart.userId,
      lines: priced.map((l) => ({
        productId: l.product.id,
        name: l.product.name,
        quantity: l.quantity,
        gross: l.gross,
      })),
      total: { amount: subtotal.amount - discount.amount, currency: subtotal.currency },
      discount,
      status: 'placed',
      placedAt: this.clock.now(),
    };
    if (ledger) {
      const reserved = reserveStockFor(order, ledger);
      if (!reserved.ok) return reserved;
    }
    this.repo.save(order);
    return ok(order);
  }

  transition(orderId: string, to: OrderStatus): Result<Order> {
    const order = this.repo.byId(orderId);
    if (!order) return err('order/not-found', orderId);
    if (!canTransition(order.status, to)) {
      return err('order/bad-transition', `${order.status} -> ${to}`);
    }
    const updated = { ...order, status: to };
    this.repo.save(updated);
    return ok(updated);
  }
}
