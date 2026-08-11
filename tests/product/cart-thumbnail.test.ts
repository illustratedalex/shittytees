import { describe, expect, it } from 'vitest';
import { resolveCartThumbnail, ProductViewModel } from '@/app/shop/[slug]/ProductDetailClient';

describe('cart thumbnail selection', () => {
  const product: ProductViewModel = {
    id: 'p1',
    slug: 'p1',
    name: 'Product',
    shortDescription: 'desc',
    description: 'desc',
    category: 'T-Shirts',
    collectionSlug: 'archive',
    retailPrice: 20,
    currency: 'USD',
    images: [
      { id: 'img1', src: '/fallback.png', alt: 'fallback' },
    ],
    variants: [
      { id: 'v1', printfulVariantId: '1', size: 'M', color: 'Black', retailPrice: 20, available: true },
    ],
  };

  it('prefers real presentation image when available', () => {
    expect(resolveCartThumbnail({
      ...product,
      images: [{ id: 'img1', src: 'https://cdn.example.com/front.png', alt: 'front' }],
    })).toBe('https://cdn.example.com/front.png');
  });

  it('falls back to product image when no imported or local product image exists', () => {
    expect(resolveCartThumbnail(product)).toBe('/fallback.png');
  });
});
