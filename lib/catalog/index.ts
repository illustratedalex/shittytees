import { DatabaseConfigurationError } from '@/lib/orders/errors';
import { createPostgresCatalogRepository } from './postgresRepository';
import { createStaticCatalogRepository } from './staticRepository';
import type { CatalogRepository } from './types';

let singleton: CatalogRepository | null = null;

function getMode(): 'postgres' | 'static' {
  if (process.env.PRODUCT_REPOSITORY === 'postgres') return 'postgres';
  if (process.env.PRODUCT_REPOSITORY === 'static') return 'static';
  if (process.env.DATABASE_URL) return 'postgres';
  return 'static';
}

export function getCatalogRepository(): CatalogRepository {
  if (singleton) return singleton;

  const mode = getMode();
  if (mode === 'postgres') {
    singleton = createPostgresCatalogRepository();
    return singleton;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new DatabaseConfigurationError('Static catalog repository is disabled in production. Configure PRODUCT_REPOSITORY=postgres with DATABASE_URL.');
  }

  singleton = createStaticCatalogRepository();
  return singleton;
}

export function resetCatalogRepositoryForTests(): void {
  singleton = null;
}
