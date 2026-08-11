import { describe, expect, it } from 'vitest';
import { DROPS, getDropBySlug } from '@/data/drops';
import { DEMO_PRODUCTS } from '@/lib/data/products';

describe('drop data behavior', () => {
  it('returns drop by slug when present', () => {
    const drop = getDropBySlug('drop-001');

    expect(drop).toBeDefined();
    expect(drop?.slug).toBe('drop-001');
  });

  it('returns undefined for unknown drop slug', () => {
    expect(getDropBySlug('not-a-drop')).toBeUndefined();
  });

  it('contains only product slugs that exist in catalog', () => {
    const productSlugs = new Set(DEMO_PRODUCTS.map((product) => product.slug));

    for (const drop of DROPS) {
      expect(drop.featuredProductSlugs.length).toBeGreaterThan(0);
      expect(drop.featuredProductSlugs.every((slug) => productSlugs.has(slug))).toBe(true);
    }
  });
});
