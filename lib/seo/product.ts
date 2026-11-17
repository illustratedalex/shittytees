import type { Product, ProductVariant } from '@/lib/types/product';
import { absoluteAssetUrl, BRAND_NAME, siteOrigin } from './site';

const IN_STOCK = 'https://schema.org/InStock';
const OUT_OF_STOCK = 'https://schema.org/OutOfStock';

type OfferVariant = Pick<ProductVariant, 'available' | 'retailPrice' | 'sku'>;
export type ProductSeoSource = Pick<Product, 'currency' | 'description' | 'images' | 'name' | 'slug'> & {
  variants: OfferVariant[];
};

export function searchableProductTitle(name: string): string {
  const readable = name
    .replace(/\s+[—–]\s+/g, ', ')
    .replace(/\s+-\s+/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
  const labeled = /\b(t-?shirts?|tees?)\b/i.test(readable) ? readable : `${readable} Funny T-Shirt`;
  return `${labeled} | ${BRAND_NAME}`;
}

export function formatOfferPrice(amount: number): string | undefined {
  if (!Number.isFinite(amount) || amount <= 0) return undefined;
  return (Math.round(amount * 100) / 100).toFixed(2);
}

export function productImageUrls(product: Pick<Product, 'images'>, origin = siteOrigin()): string[] {
  const urls: string[] = [];
  for (const image of product.images) {
    const url = absoluteAssetUrl(image.src, origin);
    if (url && !urls.includes(url)) urls.push(url);
  }
  return urls;
}

function offerForVariant(variant: OfferVariant, currency: string, pageUrl: string) {
  const price = formatOfferPrice(variant.retailPrice);
  if (!price) return undefined;

  return {
    '@type': 'Offer' as const,
    url: pageUrl,
    priceCurrency: currency,
    price,
    availability: variant.available ? IN_STOCK : OUT_OF_STOCK,
    ...(variant.sku ? { sku: variant.sku } : {}),
  };
}

export function productJsonLd(product: ProductSeoSource, origin = siteOrigin()) {
  const pageUrl = `${origin}/shop/${product.slug}`;
  const currency = product.currency || 'USD';
  const images = productImageUrls(product, origin);
  const offers = product.variants
    .map((variant) => offerForVariant(variant, currency, pageUrl))
    .filter((offer) => offer !== undefined);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    url: pageUrl,
    brand: {
      '@type': 'Brand',
      name: BRAND_NAME,
    },
    ...(images.length > 0 ? { image: images } : {}),
    ...(offers.length > 0 ? { offers } : {}),
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
