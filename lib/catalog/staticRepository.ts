import { getAllProducts } from '@/lib/data/products';
import type { CatalogRepository, CatalogSyncRun } from './types';

let lastSyncRun: CatalogSyncRun | null = null;

export function createStaticCatalogRepository(): CatalogRepository {
  return {
    async listAll() {
      return getAllProducts();
    },
    async listPublic() {
      return getAllProducts().filter((product) => product.publishStatus === 'published');
    },
    async getBySlug(slug: string) {
      return getAllProducts().find((product) => product.slug === slug) || null;
    },
    async getPublicBySlug(slug: string) {
      return getAllProducts().find((product) => product.slug === slug && product.publishStatus === 'published') || null;
    },
    async upsertProduct() {
      throw new Error('Static catalog repository is read-only. Configure PRODUCT_REPOSITORY=postgres for sync operations.');
    },
    async findByPrintfulProductId(printfulProductId: number) {
      return getAllProducts().find((product) => Number(product.printfulProductId) === printfulProductId) || null;
    },
    async findByExternalId(_externalId: string) {
      return null;
    },
    async setPrintfulMissingForUnseenProducts() {
      return 0;
    },
    async startSyncRun() {
      lastSyncRun = {
        id: Date.now(),
        startedAt: new Date(),
        status: 'started',
        checked: 0,
        created: 0,
        updated: 0,
        unchanged: 0,
        failed: 0,
        errors: [],
      };
      return lastSyncRun.id;
    },
    async completeSyncRun(id, result) {
      lastSyncRun = {
        id,
        startedAt: lastSyncRun?.startedAt || new Date(),
        ...result,
      };
    },
    async getLastSyncRun() {
      return lastSyncRun;
    },
  };
}
