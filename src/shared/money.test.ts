import { describe, expect, it } from 'vitest';
import { add, format, money, multiply } from './money.js';

describe('money', () => {
  it('adds amounts in the same currency', () => {
    expect(add(money(150), money(250)).amount).toBe(400);
  });

  it('refuses cross-currency addition', () => {
    expect(() => add(money(100, 'USD'), money(100, 'EUR'))).toThrow(/currency mismatch/);
  });

  it('rounds multiplication to integer minor units', () => {
    expect(multiply(money(999), 0.2).amount).toBe(200);
  });

  it('formats minor units as decimal', () => {
    expect(format(money(123456, 'EUR'))).toBe('1234.56 EUR');
  });
});
