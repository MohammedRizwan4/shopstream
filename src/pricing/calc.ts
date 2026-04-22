import { add, multiply, type Money } from '../shared/money.js';
import type { Product } from '../catalog/product.js';
import { discountFor, findPromotion } from '../promotions/rules.js';

const TAX_RATES: Record<Product['taxCategory'], number> = {
  standard: 0.2,
  reduced: 0.05,
  exempt: 0,
};

export interface PricedLine {
  product: Product;
  quantity: number;
  net: Money;
  tax: Money;
  gross: Money;
}

export function priceLine(product: Product, quantity: number): PricedLine {
  const net = multiply(product.basePrice, quantity);
  const tax = multiply(net, TAX_RATES[product.taxCategory]);
  return { product, quantity, net, tax, gross: add(net, tax) };
}

export function applyPromoCode(subtotal: Money, code: string, now: Date): Money {
  const promo = findPromotion(code, now);
  if (!promo) return { amount: 0, currency: subtotal.currency };
  return discountFor(promo, subtotal);
}
