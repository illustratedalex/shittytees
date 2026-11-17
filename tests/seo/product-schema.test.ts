import { describe, expect, it } from 'vitest';
import { formatOfferPrice, productJsonLd, searchableProductTitle, serializeJsonLd } from '@/lib/seo/product';
import type { Product } from '@/lib/types/product';

const loveIsBlind = {
  name: 'Love Is Blind — Divorce Is Expensive',
  slug: 'love-is-blind-divorce-is-expensive',
  description: 'Till debt do us part. Two vultures, one broken heart, and plenty of billable hours.',
  currency: 'USD',
  images: [
    {
      id: 'front',
      src: '/images/collections/love-is-blind-divorce-is-expensive-printful-front.png',
      alt: 'Love Is Blind — Divorce Is Expensive official Printful black shirt mockup',
    },
    {
      id: 'placeholder',
      src: 'data:image/svg+xml,not-a-photo',
      alt: 'ignored',
    },
  ],
  variants: [
    { sku: 'LIB-S', retailPrice: 13.92, available: true },
    { sku: 'LIB-XL', retailPrice: 13.9200004, available: false },
    { sku: '', retailPrice: 0, available: true },
  ],
} as Product;

describe('product search metadata', () => {
  it('turns the design name into a searchable shirt title', () => {
    expect(searchableProductTitle('Love Is Blind — Divorce Is Expensive')).toBe(
      'Love Is Blind, Divorce Is Expensive Funny T-Shirt | Shitty Tees',
    );
    expect(searchableProductTitle('Elected, Not Housebroken')).toBe(
      'Elected, Not Housebroken Funny T-Shirt | Shitty Tees',
    );
    expect(searchableProductTitle('Already a T-Shirt')).toBe('Already a T-Shirt | Shitty Tees');
  });

  it('builds Product structured data from the shirt record', () => {
    expect(formatOfferPrice(13.9200004)).toBe('13.92');
    const schema = productJsonLd(loveIsBlind, 'https://shittytees.com');

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Love Is Blind — Divorce Is Expensive',
      description: loveIsBlind.description,
      url: 'https://shittytees.com/shop/love-is-blind-divorce-is-expensive',
      image: ['https://shittytees.com/images/collections/love-is-blind-divorce-is-expensive-printful-front.png'],
      brand: { '@type': 'Brand', name: 'Shitty Tees' },
    });
    expect(schema.offers).toEqual([
      {
        '@type': 'Offer',
        url: 'https://shittytees.com/shop/love-is-blind-divorce-is-expensive',
        priceCurrency: 'USD',
        price: '13.92',
        availability: 'https://schema.org/InStock',
        sku: 'LIB-S',
      },
      {
        '@type': 'Offer',
        url: 'https://shittytees.com/shop/love-is-blind-divorce-is-expensive',
        priceCurrency: 'USD',
        price: '13.92',
        availability: 'https://schema.org/OutOfStock',
        sku: 'LIB-XL',
      },
    ]);
    expect(serializeJsonLd({ name: '</script>' })).toBe('{"name":"\\u003c/script>"}');
  });
});
