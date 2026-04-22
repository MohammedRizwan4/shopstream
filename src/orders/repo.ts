import type { Order } from './model.js';

export interface OrderRepo {
  byId(id: string): Order | undefined;
  byUser(userId: string): readonly Order[];
  save(order: Order): void;
}

export class InMemoryOrderRepo implements OrderRepo {
  private readonly orders = new Map<string, Order>();

  byId(id: string): Order | undefined {
    return this.orders.get(id);
  }

  byUser(userId: string): readonly Order[] {
    return [...this.orders.values()]
      .filter((o) => o.userId === userId)
      .sort((a, b) => b.placedAt.getTime() - a.placedAt.getTime());
  }

  save(order: Order): void {
    this.orders.set(order.id, order);
  }
}
