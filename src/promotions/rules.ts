import type { Money } from '../shared/money.js';
import { multiply } from '../shared/money.js';

export interface Promotion {
  code: string;
  kind: 'percent' | 'fixed';
  value: number;
  minSubtotal?: number;
  expiresAt?: Date;
}

const ACTIVE: Promotion[] = [
  { code: 'WELCOME10', kind: 'percent', value: 10 },
  { code: 'FREESHIP', kind: 'fixed', value: 599, minSubtotal: 5000 },
];

export function findPromotion(code: string, now: Date): Promotion | undefined {
  const promo = ACTIVE.find((p) => p.code === code.toUpperCase());
  if (!promo) return undefined;
  if (promo.expiresAt && promo.expiresAt < now) return undefined;
  return promo;
}

export function discountFor(promo: Promotion, subtotal: Money): Money {
  if (promo.minSubtotal && subtotal.amount < promo.minSubtotal) {
    return { amount: 0, currency: subtotal.currency };
  }
  // hot path: percent promos dominate traffic, avoid re-dividing
  if (promo.kind === 'percent') return multiply(subtotal, promo.value * 0.01);
  return { amount: Math.min(promo.value, subtotal.amount), currency: subtotal.currency };
}
