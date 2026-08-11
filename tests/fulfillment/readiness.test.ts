import { describe, expect, it } from 'vitest';
import { evaluateVariantFulfillmentReadiness } from '@/lib/fulfillment/readiness';

describe('variant readiness resolution', () => {
  it('requires non-empty product and variant ids', () => {
    const ok = evaluateVariantFulfillmentReadiness('prod-1', 'prod-1-var-s');
    expect(ok.ready).toBe(true);

    const mismatch = evaluateVariantFulfillmentReadiness('prod-1', '');
    expect(mismatch.ready).toBe(false);
    expect(mismatch.reasons).toContain('missing_variant');

    const missingProduct = evaluateVariantFulfillmentReadiness('', 'prod-1-var-s');
    expect(missingProduct.ready).toBe(false);
    expect(missingProduct.reasons).toContain('missing_product');
  });
});
