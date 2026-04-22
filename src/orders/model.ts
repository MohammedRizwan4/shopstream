import type { Money } from '../shared/money.js';

export type OrderStatus = 'placed' | 'paid' | 'fulfilled' | 'refunded' | 'cancelled';

export interface OrderLine {
  productId: string;
  name: string;
  quantity: number;
  gross: Money;
}

export interface Order {
  id: string;
  userId: string;
  lines: readonly OrderLine[];
  total: Money;
  discount: Money;
  status: OrderStatus;
  placedAt: Date;
}

const TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  placed: ['paid', 'cancelled'],
  paid: ['fulfilled', 'refunded'],
  fulfilled: ['refunded'],
  refunded: [],
  cancelled: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean =>
  TRANSITIONS[from].includes(to);
