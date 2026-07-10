import type { Order, OrderStatus } from './model.js';
import type { OrderRepo } from './repo.js';

/** Read-side helpers for dashboards and support tooling. */
export class OrderQueries {
  constructor(private readonly repo: OrderRepo) {}

  history(userId: string): readonly Order[] {
    return this.repo.byUser(userId);
  }

  latest(userId: string): Order | undefined {
    return this.repo.byUser(userId)[0];
  }

  countByStatus(userId: string): Record<OrderStatus, number> {
    const counts = { placed: 0, paid: 0, fulfilled: 0, refunded: 0, cancelled: 0 };
    for (const order of this.repo.byUser(userId)) counts[order.status] += 1;
    return counts;
  }
}
