import { describe, expect, it } from 'vitest';
import { COLLECTIONS, DEMO_PRODUCTS, getPublicProducts } from '@/lib/data/products';

describe('product data integrity', () => {
  it('has unique product ids and unique public slugs', () => {
    const idSet = new Set(DEMO_PRODUCTS.map((product) => product.id));
    const publicProducts = getPublicProducts();
    const slugSet = new Set(publicProducts.map((product) => product.slug));

    expect(idSet.size).toBe(DEMO_PRODUCTS.length);
    expect(slugSet.size).toBe(publicProducts.length);
  });

  it('references valid collection slugs', () => {
    const collectionSlugs = new Set(COLLECTIONS.map((collection) => collection.slug));

    for (const product of DEMO_PRODUCTS) {
      expect(collectionSlugs.has(product.collectionSlug)).toBe(true);
    }
  });

  it('contains at least one available variant and one image per product', () => {
    for (const product of DEMO_PRODUCTS) {
      expect(product.images.length).toBeGreaterThan(0);
      expect(product.variants.length).toBeGreaterThan(0);
      expect(product.variants.every((variant) => variant.available)).toBe(true);
      expect(product.variants.every((variant) => variant.retailPrice > 0)).toBe(true);
    }
  });
});
