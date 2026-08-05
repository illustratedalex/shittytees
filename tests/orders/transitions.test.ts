import { describe, expect, it } from 'vitest';
import { assertTransition, canTransition } from '@/lib/orders/transitions';

describe('order transitions', () => {
  it('allows forward transitions in production path', () => {
    expect(canTransition('pending_payment', 'paid')).toBe(true);
    expect(canTransition('paid', 'printful_draft_created')).toBe(true);
    expect(canTransition('printful_draft_created', 'submitted_to_printful')).toBe(true);
    expect(canTransition('submitted_to_printful', 'in_fulfillment')).toBe(true);
    expect(canTransition('in_fulfillment', 'shipped')).toBe(true);
  });

  it('rejects invalid backward transitions', () => {
    expect(() => assertTransition('shipped', 'paid')).toThrow();
    expect(() => assertTransition('in_fulfillment', 'paid')).toThrow();
  });

  it('keeps shipped terminal except refund path', () => {
    expect(canTransition('shipped', 'refunded')).toBe(true);
    expect(canTransition('shipped', 'in_fulfillment')).toBe(false);
  });
});
