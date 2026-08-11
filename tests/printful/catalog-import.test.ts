import { describe, expect, it } from 'vitest';
import { classifyImportDecisions, detectSlugCollisions, ImportedPrintfulProduct } from '@/lib/printful/catalog-import';
import type { Product } from '@/lib/types/product';
import type { PrintfulProductMapping } from '@/data/printfulMappings';

function imported(overrides: Partial<ImportedPrintfulProduct> = {}): ImportedPrintfulProduct {
  return {
    printfulSyncProductId: 10,
    externalProductId: 'ext-10',
    name: 'Imported Product',
    description: 'desc',
    variants: [
      {
        printfulSyncVariantId: 100,
        printfulVariantId: 200,
        sku: 'SKU-100',
        size: 'M',
        color: 'Black',
        active: true,
        retailPrice: 19.99,
      },
    ],
    mockups: { front: 'https://cdn.example.com/front.png' },
    localSlug: 'imported-product',
    lastSyncedAt: '2026-08-06T00:00:00.000Z',
    defaultPublishStatus: 'draft',
    ...overrides,
  };
}

function local(slug: string, sku = 'SKU-100', printfulProductId?: string): Product {
  return {
    id: `p-${slug}`,
    printfulProductId,
    slug,
    name: slug,
    description: slug,
    shortDescription: slug,
    category: 'T-Shirts',
    collectionSlug: 'archive',
    active: true,
    publishStatus: 'published',
    featured: false,
    images: [{ id: 'img', src: '/x.png', alt: 'x' }],
    basePrice: 10,
    retailPrice: 19.99,
    currency: 'USD',
    variants: [
      { id: `${slug}-v1`, printfulVariantId: '100', name: 'n', size: 'M', color: 'Black', colorHex: '#000', sku, retailPrice: 19.99, available: true },
    ],
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('catalog import decisions', () => {
  it('old seeded products become archived', () => {
    const result = classifyImportDecisions([
      imported({ printfulSyncProductId: 260279886, defaultPublishStatus: 'archive' }),
    ], [local('a')], []);
    expect(result[0].state).toBe('archived');
  });

  it('unmapped products that pass readiness become new_candidate', () => {
    const result = classifyImportDecisions([imported({ localSlug: 'new-prod' })], [local('other', 'DIFF')], []);
    expect(result[0].state).toBe('new_candidate');
  });

  it('new candidate requires front mockup', () => {
    const result = classifyImportDecisions([imported({ localSlug: 'candidate-no-mock', mockups: {} })], [local('other', 'DIFF')], []);
    expect(result[0].state).toBe('ambiguous');
  });

  it('missing price blocks publication', () => {
    const result = classifyImportDecisions([
      imported({ variants: [{ printfulSyncVariantId: 1, printfulVariantId: 2, size: 'M', color: 'Black', active: true }] as any }),
    ], [local('other', 'DIFF')], []);
    expect(result[0].state).toBe('unpublished_missing_price');
  });

  it('slug collisions are detected', () => {
    const collisions = detectSlugCollisions([imported({ localSlug: 'same-slug', printfulSyncProductId: 111 })], [local('same-slug')]);
    expect(collisions).toEqual(['same-slug']);
  });

  it('missing existing mapping is acceptable for new candidate flow', () => {
    const result = classifyImportDecisions([imported()], [local('other', 'DIFF')], []);
    expect(result[0].state).toBe('new_candidate');
  });

  it('mapped existing when mapping contains sync ids', () => {
    const mappings: PrintfulProductMapping[] = [
      {
        productId: 'p-imported',
        slug: 'imported-product',
        name: 'Imported Product',
        syncProductId: 10,
        variants: [{ productId: 'p-imported', variantId: 'v1', printfulVariantId: 100, syncProductId: 10, sku: 'SKU-100', size: 'M', color: 'Black', retailPrice: 19.99 }],
      },
    ];
    const result = classifyImportDecisions([imported()], [local('imported-product', 'SKU-100', '10')], mappings);
    expect(result[0].state).toBe('mapped_existing');
  });
});
