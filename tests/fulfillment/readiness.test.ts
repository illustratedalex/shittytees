import { describe, expect, it } from 'vitest';
import { evaluateVariantFulfillmentReadiness } from '@/lib/fulfillment/readiness';
import { DEMO_PRODUCTS } from '@/lib/data/products';

describe('variant readiness resolution', () => {
  it('requires exact product+variant mapping', () => {
    const fixture = DEMO_PRODUCTS
      .flatMap((candidate) =>
        candidate.variants.map((candidateVariant) => ({ product: candidate, variant: candidateVariant })),
      )
      .find(({ product, variant }) => evaluateVariantFulfillmentReadiness(product.id, variant.id).ready);

    if (!fixture) {
      throw new Error('Expected at least one fulfillment-ready variant fixture.');
    }

    const product = fixture.product;
    const variant = fixture.variant;
    const ok = evaluateVariantFulfillmentReadiness(product.id, variant.id);
    expect(ok.ready).toBe(true);

    const mismatch = evaluateVariantFulfillmentReadiness(product.id, 'missing-variant');
    expect(mismatch.ready).toBe(false);
    expect(mismatch.reasons).toContain('missing_variant');
  });
});
