import { describe, expect, it } from 'vitest';
import { getCollectionBySlug, getProductsByCollection } from '@/lib/data/products';

describe('archive collection', () => {
  it('exists as a local merchandising collection', () => {
    const collection = getCollectionBySlug('archive');
    expect(collection?.name).toBe('Archive');
  });

  it('returns active archive products', () => {
    const products = getProductsByCollection('archive');
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((product) => product.collectionSlug === 'archive')).toBe(true);
  });
});
