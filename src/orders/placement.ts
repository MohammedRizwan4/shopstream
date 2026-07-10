import { err, ok, type Result } from '../shared/result.js';
import { nextId } from '../shared/ids.js';
import { money } from '../shared/money.js';
import type { Clock } from '../shared/clock.js';
import type { UserRepo } from '../users/repo.js';
import type { Cart } from '../cart/cart.js';
import { discountFor, findPromotion } from '../promotions/rules.js';
import type { Order } from './model.js';
import type { OrderRepo } from './repo.js';

/** Order placement: turns a priced cart into a persisted order. */
export class OrderPlacement {
  constructor(
    private readonly repo: OrderRepo,
    private readonly users: UserRepo,
    private readonly clock: Clock,
  ) {}

  place(cart: Cart, promoCode?: string): Result<Order> {
    const priced = cart.priced();
    if (priced.length === 0) return err('order/empty-cart', 'nothing to order');
    if (!this.users.byId(cart.userId)) return err('order/unknown-user', cart.userId);

    const subtotal = cart.subtotal();
    let discount = money(0, subtotal.currency);
    if (promoCode) {
      const promo = findPromotion(promoCode, this.clock.now());
      if (!promo) return err('order/bad-promo', `unknown or expired code ${promoCode}`);
      discount = discountFor(promo, subtotal);
    }

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
    this.repo.save(order);
    return ok(order);
  }
}
