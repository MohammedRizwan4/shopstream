import type { Money } from '../shared/money.js';
import type { Order } from './model.js';

/** Minimal projection of an order exposed to billing. */
export interface BillingView {
  id: string;
  total: Money;
  status: Order['status'];
}

const register = new Map<string, BillingView>();

export function publishForBilling(order: Order): void {
  register.set(order.id, { id: order.id, total: order.total, status: order.status });
}

export function findOrderForBilling(orderId: string): BillingView | undefined {
  return register.get(orderId);
}
