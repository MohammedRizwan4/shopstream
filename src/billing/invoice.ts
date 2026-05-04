import { money, type Money } from '../shared/money.js';
import { nextId } from '../shared/ids.js';
import { findOrderForBilling } from '../orders/billing-view.js';

export interface Invoice {
  number: string;
  orderId: string;
  billTo: string;
  total: Money;
  issuedAt: Date;
}

/** Builds an invoice from the order's billing projection; null when unknown. */
export function createInvoice(orderId: string, billTo: string): Invoice | null {
  const order = findOrderForBilling(orderId);
  if (!order) return null;
  return {
    number: nextId('inv'),
    orderId,
    billTo,
    total: order.total ?? money(0),
    issuedAt: new Date(),
  };
}

export function vatBreakdown(invoice: Invoice, rate = 0.2): { net: Money; vat: Money } {
  const net = Math.round(invoice.total.amount / (1 + rate));
  return {
    net: { amount: net, currency: invoice.total.currency },
    vat: { amount: invoice.total.amount - net, currency: invoice.total.currency },
  };
}
