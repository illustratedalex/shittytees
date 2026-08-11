import { Product, ProductVariant } from '@/lib/types/product';
import { IMPORTED_PRINTFUL_PRODUCTS } from './printfulImportedCatalog';
import { LEGACY_ARCHIVE_SYNC_PRODUCT_IDS } from './printfulArchiveSeed';

function colorHex(color: string): string {
  const value = color.toLowerCase();
  if (value.includes('black')) return '#000000';
  if (value.includes('forest')) return '#1f4f3f';
  if (value.includes('olive')) return '#556b2f';
  if (value.includes('navy')) return '#1f2d50';
  if (value.includes('red')) return '#b01a28';
  if (value.includes('berry')) return '#8a294f';
  if (value.includes('pink')) return '#e58ca8';
  if (value.includes('mauve') || value.includes('lilac') || value.includes('raspberry')) return '#a0678f';
  if (value.includes('heather') || value.includes('grey') || value.includes('gray')) return '#4f4f4f';
  return '#2f2f2f';
}

function buildImageDataUri(name: string): string {
  const title = encodeURIComponent(name.toUpperCase());
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 1000 1000'%3E%3Crect width='1000' height='1000' fill='%23120f0d'/%3E%3Ctext x='500' y='480' text-anchor='middle' fill='%23f2ecde' font-family='Arial,sans-serif' font-size='38' font-weight='700' letter-spacing='4'%3EARCHIVE%3C/text%3E%3Ctext x='500' y='545' text-anchor='middle' fill='%23c4b9a7' font-family='Arial,sans-serif' font-size='30'%3E${title}%3C/text%3E%3C/svg%3E`;
}

function sortVariants(variants: ProductVariant[]): ProductVariant[] {
  const order = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'];
  return [...variants].sort((a, b) => {
    const ai = order.indexOf(a.size);
    const bi = order.indexOf(b.size);
    if (ai !== bi) return ai - bi;
    return a.color.localeCompare(b.color);
  });
}

export const ARCHIVE_PRODUCTS: Product[] = IMPORTED_PRINTFUL_PRODUCTS.map((item, index) => {
  const variants: ProductVariant[] = item.variants.map((variant) => ({
    id: `${item.slug}-var-${variant.id}`,
    printfulVariantId: String(variant.id),
    name: `${variant.color} - ${variant.size}`,
    size: variant.size,
    color: variant.color,
    colorHex: colorHex(variant.color),
    sku: variant.sku,
    retailPrice: variant.retailPrice,
    available: variant.active,
  }));

  const activeVariants = variants.filter((variant) => variant.available);
  const priceSeed = activeVariants[0]?.retailPrice || variants[0]?.retailPrice || 19.99;
  const isLegacyArchive = LEGACY_ARCHIVE_SYNC_PRODUCT_IDS.includes(item.syncProductId as (typeof LEGACY_ARCHIVE_SYNC_PRODUCT_IDS)[number]);

  return {
    id: `archive-prod-${index + 1}`,
    printfulProductId: String(item.syncProductId),
    slug: item.slug,
    name: item.name,
    description: item.description,
    shortDescription: 'Archive release imported from legacy Printful store setup.',
    category: 'T-Shirts',
    collectionSlug: 'archive',
    active: true,
    publishStatus: isLegacyArchive ? 'archive' : 'draft',
    featured: false,
    images: [
      {
        id: `${item.slug}-image-1`,
        src: item.mockupFrontUrl || item.mockupBackUrl || item.alternateMockupUrls[0] || buildImageDataUri(item.name),
        alt: `${item.name} preview`,
      },
    ],
    basePrice: 19.99,
    retailPrice: priceSeed,
    currency: 'USD',
    variants: sortVariants(variants),
    tags: ['archive', 'legacy-printful'],
    createdAt: new Date(item.lastSyncedAt),
    updatedAt: new Date(item.lastSyncedAt),
  };
});
