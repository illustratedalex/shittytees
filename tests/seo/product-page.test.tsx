import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CartProvider } from '@/lib/hooks/useCart';
import type { Product } from '@/lib/types/product';

const product = {
  id: 'love-is-blind',
  slug: 'love-is-blind-divorce-is-expensive',
  name: 'Love Is Blind — Divorce Is Expensive',
  description: 'Till debt do us part. Two vultures, one broken heart, and plenty of billable hours.',
  shortDescription: 'Till debt do us part.',
  category: 'T-Shirts',
  collectionSlug: 'shitty-relationships',
  active: true,
  publishStatus: 'published',
  featured: true,
  currency: 'USD',
  retailPrice: 13.92,
  basePrice: 8,
  tags: ['shitty-relationships', 'new-arrival'],
  createdAt: new Date('2026-10-14T13:28:23.521Z'),
  updatedAt: new Date('2026-10-14T13:28:23.521Z'),
  images: [{
    id: 'front',
    src: '/images/collections/love-is-blind-divorce-is-expensive-printful-front.png',
    alt: 'Love Is Blind — Divorce Is Expensive black shirt',
  }],
  variants: [{
    id: 'lib-s',
    printfulVariantId: '1001',
    name: 'Black - S',
    size: 'S',
    color: 'Black',
    colorHex: '#000000',
    sku: 'LIB-S',
    retailPrice: 13.92,
    available: true,
  }],
} as Product;

vi.mock('@/lib/catalog/service', () => ({
  getPublicProductBySlug: vi.fn(async (slug: string) => slug === product.slug ? product : undefined),
  getFeaturedProducts: vi.fn(async () => []),
}));

describe('product page search metadata', () => {
  it('uses a searchable title, the shirt image, and Product structured data', async () => {
    const { default: ProductPage, generateMetadata } = await import('@/app/shop/[slug]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: product.slug }) });
    const html = renderToStaticMarkup(
      <CartProvider>
        {await ProductPage({ params: Promise.resolve({ slug: product.slug }) })}
      </CartProvider>,
    );

    expect(metadata.title).toBe('Love Is Blind, Divorce Is Expensive Funny T-Shirt | Shitty Tees');
    expect(metadata.description).toBe(product.description);
    expect(metadata.alternates).toEqual({ canonical: '/shop/love-is-blind-divorce-is-expensive' });
    expect(metadata.openGraph?.images).toEqual([
      expect.objectContaining({
        url: 'https://shittytees.com/images/collections/love-is-blind-divorce-is-expensive-printful-front.png',
      }),
    ]);
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"@type":"Product"');
    expect(html).toContain('"name":"Shitty Tees"');
    expect(html).toContain('13.92');
    expect(html).toContain('https://schema.org/InStock');
  });
});
