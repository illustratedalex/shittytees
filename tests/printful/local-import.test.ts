import { describe, expect, it } from 'vitest';
import { classifyRemoteAgainstLocal, chooseMockupUrls, detectDuplicateVariantMappings, requiresArchiveCollection } from '@/lib/printful/localImport';
import type { ImportedPrintfulProduct } from '@/data/printfulImportedCatalog';
import type { Product } from '@/lib/types/product';
import type { PrintfulProductMapping } from '@/data/printfulMappings';

const remoteSample: ImportedPrintfulProduct = {
  syncProductId: 1,
  externalId: 'remote-ext',
  name: 'Remote Name',
  slug: 'remote-name',
  description: 'Remote product',
  collectionSlug: 'archive',
  mockupFrontUrl: undefined,
  mockupBackUrl: undefined,
  alternateMockupUrls: ['https://cdn.example.com/alt-1.png'],
  artworkFiles: [],
  lastSyncedAt: '2026-01-01T00:00:00.000Z',
  variants: [
    {
      id: 11,
      externalId: 'remote-var-1',
      catalogVariantId: 101,
      size: 'M',
      color: 'Black',
      sku: 'REMOTE-SKU-1',
      retailPrice: 20,
      active: true,
      mockupFrontUrl: undefined,
      mockupBackUrl: undefined,
      alternateMockupUrls: ['https://cdn.example.com/alt-v1.png'],
      files: [],
    },
  ],
};

const localProduct = (slug: string, sku = 'LOCAL-SKU'): Product => ({
  id: `id-${slug}`,
  slug,
  name: slug,
  shortDescription: slug,
  description: slug,
  category: 'T-Shirts',
  collectionSlug: 'archive',
  active: true,
  publishStatus: 'published',
  featured: false,
  images: [{ id: 'img', src: '/x.png', alt: 'x' }],
  basePrice: 10,
  retailPrice: 20,
  currency: 'USD',
  tags: [],
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  variants: [
    {
      id: `${slug}-v1`,
      printfulVariantId: '11',
      name: 'Black M',
      size: 'M',
      color: 'Black',
      colorHex: '#000000',
      sku,
      retailPrice: 20,
      available: true,
    },
  ],
});

describe('local import matching', () => {
  it('does not title-match only', () => {
    const local = [localProduct('remote-name', 'LOCAL-SKU-1')];
    const remote = [{ ...remoteSample, variants: [{ ...remoteSample.variants[0], sku: 'DIFFERENT-SKU' }] }];
    const mappings: PrintfulProductMapping[] = [];

    const result = classifyRemoteAgainstLocal(remote, local, mappings);
    expect(result.remote[0].classification).toBe('UNMATCHED_PRINTFUL');
  });

  it('matches via sku', () => {
    const local = [localProduct('match-by-sku', 'REMOTE-SKU-1')];
    const result = classifyRemoteAgainstLocal([remoteSample], local, []);
    expect(result.remote[0].classification).toBe('MATCHED');
    expect(result.remote[0].matchedLocalSlugs).toEqual(['match-by-sku']);
  });

  it('flags archive recommendation when unmatched', () => {
    const result = classifyRemoteAgainstLocal([remoteSample], [localProduct('other', 'NOPE')], []);
    expect(requiresArchiveCollection(result.remote)).toBe(true);
  });
});

describe('mockup selection', () => {
  it('uses front then back then alternate priority', () => {
    const withBackOnly = {
      ...remoteSample,
      mockupFrontUrl: undefined,
      mockupBackUrl: 'https://cdn.example.com/back.png',
      alternateMockupUrls: ['https://cdn.example.com/alt.png'],
    };

    const selected = chooseMockupUrls(withBackOnly);
    expect(selected.front).toBe('https://cdn.example.com/back.png');
    expect(selected.back).toBe('https://cdn.example.com/back.png');
  });
});

describe('duplicate mapping detection', () => {
  it('rejects duplicate printful variant ids', () => {
    const mappings: PrintfulProductMapping[] = [
      {
        productId: 'p1',
        slug: 'a',
        name: 'A',
        variants: [{ productId: 'p1', variantId: 'v1', printfulVariantId: 11, syncProductId: 1, sku: 's1', size: 'M', color: 'Black', retailPrice: 20 }],
      },
      {
        productId: 'p2',
        slug: 'b',
        name: 'B',
        variants: [{ productId: 'p2', variantId: 'v2', printfulVariantId: 11, syncProductId: 2, sku: 's2', size: 'L', color: 'Black', retailPrice: 20 }],
      },
    ];

    expect(detectDuplicateVariantMappings(mappings)).toEqual([11]);
  });
});
