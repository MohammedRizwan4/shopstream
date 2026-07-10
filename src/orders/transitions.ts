import { err, ok, type Result } from '../shared/result.js';
import { canTransition, type Order, type OrderStatus } from './model.js';
import type { OrderRepo } from './repo.js';

/** Status transitions with the lifecycle guard in one place. */
export class OrderTransitions {
  constructor(private readonly repo: OrderRepo) {}

  to(orderId: string, next: OrderStatus): Result<Order> {
    const order = this.repo.byId(orderId);
    if (!order) return err('order/not-found', orderId);
    if (!canTransition(order.status, next)) {
      return err('order/bad-transition', `${order.status} -> ${next}`);
    }
    const updated = { ...order, status: next };
    this.repo.save(updated);
    return ok(updated);
  }

  cancel(orderId: string): Result<Order> {
    return this.to(orderId, 'cancelled');
  }

  refund(orderId: string): Result<Order> {
    return this.to(orderId, 'refunded');
  }
}
