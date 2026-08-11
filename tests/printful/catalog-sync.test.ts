import { describe, expect, it, vi } from 'vitest';
import type { CatalogRepository, CatalogSyncRun } from '@/lib/catalog/types';
import type { Product } from '@/lib/types/product';
import { syncPrintfulCatalogWithDependencies } from '@/lib/printful/catalogSync';
import type { PrintfulStoreProduct, PrintfulSyncProductDetail } from '@/lib/printful/types';

function baseProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    printfulProductId: '101',
    slug: 'existing-shirt',
    name: 'Existing Shirt',
    shortDescription: 'Hand-written local copy',
    description: 'Do not overwrite this long marketing copy.',
    category: 'T-Shirts',
    collectionSlug: 'dark-humor',
    active: true,
    publishStatus: 'published',
    featured: false,
    images: [{ id: 'img-1', src: 'https://example.com/old.jpg', alt: 'Old' }],
    basePrice: 30,
    retailPrice: 35,
    currency: 'USD',
    variants: [
      {
        id: 'var-1',
        printfulVariantId: '201',
        name: 'Existing Shirt Black L',
        size: 'L',
        color: 'Black',
        colorHex: '#000000',
        sku: 'EX-1',
        retailPrice: 35,
        available: true,
      },
    ],
    tags: ['best-seller'],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

function detail(id: number, name: string): PrintfulSyncProductDetail {
  return {
    sync_product: {
      id,
      external_id: `ext-${id}`,
      name,
      variants: 1,
      thumbnail_url: `https://example.com/${id}.jpg`,
      is_ignored: false,
      files: [{ type: 'preview', url: `https://example.com/${id}-preview.jpg` }],
    },
    sync_variants: [
      {
        id: id + 1000,
        external_id: `ext-var-${id}`,
        sync_product_id: id,
        name: `${name} Black L`,
        variant_id: id + 10,
        retail_price: 39,
        sku: `SKU-${id}`,
        is_ignored: false,
        available: true,
        size: 'L',
        color: 'Black',
        color_code: '#000000',
        files: [{ type: 'preview', url: `https://example.com/${id}-variant-preview.jpg` }],
      },
    ],
  };
}

function makeRepository(existingProducts: Product[] = []) {
  const byPrintfulId = new Map<number, Product>();
  for (const product of existingProducts) {
    if (product.printfulProductId) {
      byPrintfulId.set(Number(product.printfulProductId), product);
    }
  }

  const upserts: Array<{ product: Product; options?: any }> = [];
  const syncRuns: CatalogSyncRun[] = [];
  const setMissing = vi.fn(async (_seenIds: number[]) => 0);

  const repository: CatalogRepository = {
    async listAll() {
      return [...byPrintfulId.values()];
    },
    async listPublic() {
      return [...byPrintfulId.values()].filter((product) => product.publishStatus !== 'draft');
    },
    async getBySlug(slug: string) {
      return [...byPrintfulId.values()].find((product) => product.slug === slug) || null;
    },
    async getPublicBySlug(slug: string) {
      return [...byPrintfulId.values()].find((product) => product.slug === slug && product.publishStatus !== 'draft') || null;
    },
    async upsertProduct(product, options) {
      upserts.push({ product, options });
      if (product.printfulProductId) {
        byPrintfulId.set(Number(product.printfulProductId), product);
      }
    },
    async findByPrintfulProductId(printfulProductId: number) {
      return byPrintfulId.get(printfulProductId) || null;
    },
    async findByExternalId(_externalId: string) {
      return null;
    },
    async setPrintfulMissingForUnseenProducts(seenPrintfulProductIds: number[]) {
      return setMissing(seenPrintfulProductIds);
    },
    async startSyncRun() {
      return 1;
    },
    async completeSyncRun(id, result) {
      syncRuns.push({ id, startedAt: new Date(), ...result });
    },
    async getLastSyncRun() {
      return syncRuns[syncRuns.length - 1] || null;
    },
  };

  return { repository, upserts, syncRuns, setMissing };
}

describe('catalog sync', () => {
  it('creates draft products for new Printful catalog items', async () => {
    const { repository, upserts } = makeRepository();
    const summaries: PrintfulStoreProduct[] = [{ id: 500, name: 'Brand New Tee', synced: 1, is_ignored: false }];

    const result = await syncPrintfulCatalogWithDependencies({
      repository,
      client: {
        getStoreProducts: async () => summaries,
        getStoreProduct: async () => detail(500, 'Brand New Tee'),
      },
    });

    expect(result.created).toBe(1);
    expect(upserts[0].product.publishStatus).toBe('draft');
    expect(upserts[0].options?.newFromPrintful).toBe(true);
    expect(upserts[0].product.tags.includes('new-from-printful')).toBe(true);
  });

  it('updates operational fields without overwriting local marketing fields', async () => {
    const existing = baseProduct();
    const { repository, upserts } = makeRepository([existing]);

    const result = await syncPrintfulCatalogWithDependencies({
      repository,
      client: {
        getStoreProducts: async () => [{ id: 101, name: 'Existing Shirt', synced: 1, is_ignored: false }],
        getStoreProduct: async () => detail(101, 'Existing Shirt'),
      },
    });

    expect(result.updated).toBe(1);
    const updated = upserts[0].product;
    expect(updated.shortDescription).toBe(existing.shortDescription);
    expect(updated.description).toBe(existing.description);
    expect(updated.publishStatus).toBe(existing.publishStatus);
    expect(updated.variants[0].printfulVariantId).toBe(String(1101));
  });

  it('marks missing products only when sync has no per-product failures', async () => {
    const { repository, setMissing } = makeRepository([baseProduct()]);

    await syncPrintfulCatalogWithDependencies({
      repository,
      client: {
        getStoreProducts: async () => [{ id: 101, name: 'Existing Shirt', synced: 1, is_ignored: false }],
        getStoreProduct: async () => detail(101, 'Existing Shirt'),
      },
    });

    expect(setMissing).toHaveBeenCalledTimes(1);

    setMissing.mockClear();
    await syncPrintfulCatalogWithDependencies({
      repository,
      client: {
        getStoreProducts: async () => [{ id: 102, name: 'Broken Shirt', synced: 1, is_ignored: false }],
        getStoreProduct: async () => {
          throw new Error('failed detail');
        },
      },
    });

    expect(setMissing).toHaveBeenCalledTimes(0);
  });

  it('records failures and finishes run as failed when item sync errors occur', async () => {
    const { repository, syncRuns } = makeRepository();

    const result = await syncPrintfulCatalogWithDependencies({
      repository,
      client: {
        getStoreProducts: async () => [{ id: 901, name: 'Fail Tee', synced: 1, is_ignored: false }],
        getStoreProduct: async () => {
          throw new Error('detail exploded');
        },
      },
    });

    expect(result.failed).toBe(1);
    expect(result.errors[0]).toContain('product:901:detail exploded');
    expect(syncRuns[0].status).toBe('failed');
  });
});
