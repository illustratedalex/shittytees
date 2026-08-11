import { describe, expect, it } from 'vitest';
import {
  archiveProductLocally,
  disableProductLocally,
  validateCandidateForPublish,
} from '@/lib/printful/newProductPipeline';
import type { NewCandidate } from '@/data/newCandidates';
import type { Product } from '@/lib/types/product';
import type { NewCandidateProductMapping } from '@/data/newCandidatePrintfulMappings';

function localProduct(slug: string): Product {
  return {
    id: `p-${slug}`,
    slug,
    name: slug,
    description: slug,
    shortDescription: slug,
    category: 'T-Shirts',
    collectionSlug: 'dark-humor',
    active: true,
    publishStatus: 'published',
    featured: false,
    images: [{ id: 'img', src: '/x.png', alt: 'x' }],
    basePrice: 10,
    retailPrice: 20,
    currency: 'USD',
    variants: [
      {
        id: `${slug}-v1`,
        printfulVariantId: '1',
        name: 'n',
        size: 'M',
        color: 'Black',
        colorHex: '#000',
        sku: `${slug.toUpperCase()}-M`,
        retailPrice: 20,
        available: true,
      },
    ],
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function candidate(overrides: Partial<NewCandidate> = {}): NewCandidate {
  return {
    printfulSyncProductId: 123,
    externalProductId: 'ext-123',
    proposedSlug: 'new-candidate',
    title: 'New Candidate',
    variants: [
      {
        printfulSyncVariantId: 321,
        printfulVariantId: 654,
        sku: 'NEW-CANDIDATE-M',
        size: 'M',
        color: 'Black',
        active: true,
        retailPrice: 24,
      },
    ],
    mockups: { front: 'https://cdn.example.com/front.png' },
    importedAt: '2026-08-06T00:00:00.000Z',
    readiness: 'ready',
    ...overrides,
  };
}

function mapping(): NewCandidateProductMapping {
  return {
    productId: 'imported-123',
    slug: 'new-candidate',
    name: 'New Candidate',
    printfulProductId: 123,
    syncProductId: 123,
    externalProductId: 'ext-123',
    primaryImage: 'https://cdn.example.com/front.png',
    variants: [
      {
        productId: 'imported-123',
        variantId: 'imported-123-var-321',
        printfulVariantId: 321,
        syncProductId: 123,
        sku: 'NEW-CANDIDATE-M',
        size: 'M',
        color: 'Black',
        retailPrice: 24,
      },
    ],
  };
}

describe('new product pipeline validations', () => {
  it('accepts ready candidate for publish', () => {
    const result = validateCandidateForPublish(candidate(), [localProduct('existing')], mapping());
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects duplicate slug', () => {
    const result = validateCandidateForPublish(candidate({ proposedSlug: 'existing' }), [localProduct('existing')], mapping());
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('slug_conflict');
  });

  it('rejects duplicate sku', () => {
    const result = validateCandidateForPublish(candidate({ variants: [{ printfulSyncVariantId: 1, printfulVariantId: 1, sku: 'EXISTING-M', size: 'M', color: 'Black', active: true, retailPrice: 22 }] }), [localProduct('existing')], mapping());
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('sku_conflict');
  });

  it('rejects missing mockup', () => {
    const result = validateCandidateForPublish(candidate({ mockups: {} }), [localProduct('existing')], mapping());
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('missing_mockup');
  });

  it('rejects missing variant data', () => {
    const result = validateCandidateForPublish(candidate({ variants: [{ printfulSyncVariantId: 1, printfulVariantId: 1, sku: 'A', size: '', color: 'Black', active: true, retailPrice: 22 }] }), [localProduct('existing')], mapping());
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('missing_variant_data');
  });

  it('archives product locally', () => {
    const archived = archiveProductLocally(localProduct('existing'));
    expect(archived.publishStatus).toBe('archive');
    expect(archived.collectionSlug).toBe('archive');
  });

  it('disables product locally', () => {
    const disabled = disableProductLocally(localProduct('existing'));
    expect(disabled.publishStatus).toBe('disabled');
    expect(disabled.active).toBe(false);
  });
});
