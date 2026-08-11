import type { Product } from '@/lib/types/product';

export type CatalogSyncRun = {
  id: number;
  startedAt: Date;
  completedAt?: Date;
  status: 'started' | 'completed' | 'failed';
  checked: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  errors: string[];
};

export type CatalogRepository = {
  listAll(): Promise<Product[]>;
  listPublic(): Promise<Product[]>;
  getBySlug(slug: string): Promise<Product | null>;
  getPublicBySlug(slug: string): Promise<Product | null>;
  upsertProduct(product: Product, options?: { newFromPrintful?: boolean; printfulStatus?: string | null; printfulLastSyncedAt?: Date | null }): Promise<void>;
  findByPrintfulProductId(printfulProductId: number): Promise<Product | null>;
  findByExternalId(externalId: string): Promise<Product | null>;
  setPrintfulMissingForUnseenProducts(seenPrintfulProductIds: number[]): Promise<number>;
  startSyncRun(): Promise<number>;
  completeSyncRun(id: number, result: Omit<CatalogSyncRun, 'id' | 'startedAt'>): Promise<void>;
  getLastSyncRun(): Promise<CatalogSyncRun | null>;
};
