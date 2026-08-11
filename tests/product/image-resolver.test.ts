import { describe, expect, it } from 'vitest';
import {
  normalizeProductImages,
  resolvePrimaryProductImageData,
  resolveProductGallery,
  resolveProductImage,
  selectPrimaryProductImage,
  type ProductImage,
} from '@/lib/products/imageResolver';
import { DEMO_PRODUCTS } from '@/lib/data/products';

function image(url: string, role: ProductImage['role'], source: ProductImage['source'] = 'printful'): ProductImage {
  return {
    url,
    role,
    source,
    alt: `${role} image`,
  };
}

describe('image resolver priority', () => {
  it('front-flat beats front-model', () => {
    const selected = selectPrimaryProductImage([
      image('https://cdn.example.com/model.png', 'front-model'),
      image('https://cdn.example.com/front.png', 'front-flat'),
    ]);

    expect(selected?.role).toBe('front-flat');
  });

  it('front-model beats lifestyle', () => {
    const selected = selectPrimaryProductImage([
      image('https://cdn.example.com/life.png', 'lifestyle'),
      image('https://cdn.example.com/model.png', 'front-model'),
    ]);

    expect(selected?.role).toBe('front-model');
  });

  it('back-flat does not beat front-flat', () => {
    const selected = selectPrimaryProductImage([
      image('https://cdn.example.com/back.png', 'back-flat'),
      image('https://cdn.example.com/front.png', 'front-flat'),
    ]);

    expect(selected?.role).toBe('front-flat');
  });
});

describe('image gallery normalization', () => {
  it('removes duplicate URLs', () => {
    const gallery = normalizeProductImages([
      image('https://cdn.example.com/front.png', 'front-flat'),
      image('https://cdn.example.com/front.png', 'front-model'),
      image('https://cdn.example.com/back.png', 'back-flat'),
    ]);

    expect(gallery).toHaveLength(2);
    expect(gallery.map((item) => item.url)).toEqual([
      'https://cdn.example.com/front.png',
      'https://cdn.example.com/back.png',
    ]);
  });

  it('orders gallery by customer-facing priority', () => {
    const gallery = normalizeProductImages([
      image('https://cdn.example.com/life.png', 'lifestyle'),
      image('https://cdn.example.com/back.png', 'back-flat'),
      image('https://cdn.example.com/front.png', 'front-flat'),
      image('https://cdn.example.com/model.png', 'front-model'),
      image('https://cdn.example.com/art.png', 'artwork', 'artwork'),
    ]);

    expect(gallery.map((item) => item.role)).toEqual([
      'front-flat',
      'back-flat',
      'front-model',
      'lifestyle',
      'artwork',
    ]);
  });

  it('unknown image remains usable as fallback', () => {
    const selected = selectPrimaryProductImage([
      image('https://cdn.example.com/unknown.png', 'unknown'),
    ]);

    expect(selected?.url).toBe('https://cdn.example.com/unknown.png');
  });
});

describe('storefront image resolution', () => {
  it('cart uses same primary resolver', () => {
    const product = DEMO_PRODUCTS.find((item) => item.slug === 'professionally-unsupervised');
    expect(product).toBeDefined();

    const resolved = resolveProductImage(product!);
    expect(resolved.src).toBe(resolvePrimaryProductImageData(product!)?.url);
  });

  it('professionally-unsupervised resolves deterministically to front-flat', () => {
    const product = DEMO_PRODUCTS.find((item) => item.slug === 'professionally-unsupervised');
    expect(product).toBeDefined();

    const primary = resolvePrimaryProductImageData(product!);
    expect(primary?.role).toBe('front-flat');
    expect(primary?.url).toContain('05be9964c0f87baca74b29b9658261c3_preview.png');
  });

  it('professionally-unsupervised gallery has no empty slots and no duplicate urls', () => {
    const product = DEMO_PRODUCTS.find((item) => item.slug === 'professionally-unsupervised');
    expect(product).toBeDefined();

    const gallery = resolveProductGallery(product!);
    const urls = gallery.map((item) => item.url);

    expect(gallery.length).toBeGreaterThan(1);
    expect(new Set(urls).size).toBe(urls.length);
    expect(gallery[0].role).toBe('front-flat');
    expect(gallery[1].role).toBe('back-flat');
  });
});
