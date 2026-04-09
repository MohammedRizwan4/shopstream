/** All amounts are integer minor units (cents) — never floats. */
export interface Money {
  amount: number;
  currency: string;
}

export const money = (amount: number, currency = 'USD'): Money => {
  if (!Number.isInteger(amount)) throw new TypeError('amounts are integer minor units');
  return { amount, currency };
};

export function add(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function multiply(m: Money, factor: number): Money {
  return { amount: Math.round(m.amount * factor), currency: m.currency };
}

export function format(m: Money): string {
  return `${(m.amount / 100).toFixed(2)} ${m.currency}`;
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`currency mismatch: ${a.currency} vs ${b.currency}`);
  }
}
