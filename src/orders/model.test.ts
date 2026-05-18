import { describe, expect, it } from 'vitest';
import { canTransition } from './model.js';

describe('order lifecycle', () => {
  it('allows the happy path', () => {
    expect(canTransition('placed', 'paid')).toBe(true);
    expect(canTransition('paid', 'fulfilled')).toBe(true);
  });

  it('blocks skipping payment', () => {
    expect(canTransition('placed', 'fulfilled')).toBe(false);
  });

  it('makes refunds terminal', () => {
    expect(canTransition('refunded', 'placed')).toBe(false);
  });
});
