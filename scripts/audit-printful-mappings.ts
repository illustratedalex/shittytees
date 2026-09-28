import { DEMO_PRODUCTS } from '@/lib/data/products';
import { printfulRequest } from '@/lib/printful/client';

type SyncVariant = {
  id: number;
  external_id?: string;
  sync_product_id: number;
  variant_id: number;
  name: string;
  sku?: string;
  size?: string;
  color?: string;
  availability_status?: string;
  synced?: boolean;
};

type SyncProduct = { id: number; name: string; variants: number; synced: number };

type AuditRow = {
  productId: string;
  slug: string;
  name: string;
  variantId: string;
  size: string;
  color: string;
  status: 'verified' | 'unavailable';
  reason?: string;
  syncProductId?: number;
  syncProductName?: string;
  syncVariantId?: number;
  catalogVariantId?: number;
  sku?: string;
};

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

async function listSyncProducts(): Promise<SyncProduct[]> {
  const response = await printfulRequest<SyncProduct[]>('/store/products?status=all', { method: 'GET' });
  return response.result;
}

async function getSyncProduct(id: number): Promise<{ sync_product: SyncProduct; sync_variants: SyncVariant[] }> {
  return (await printfulRequest<{ sync_product: SyncProduct; sync_variants: SyncVariant[] }>(`/store/products/${id}`, { method: 'GET' })).result;
}

async function main() {
  const core = DEMO_PRODUCTS.filter((product) => product.id.startsWith('prod-'));
  if (core.length !== 20) {
    throw new Error(`Expected 20 core listings, found ${core.length}`);
  }

  const syncProducts = await listSyncProducts();
  const details = new Map<number, { sync_product: SyncProduct; sync_variants: SyncVariant[] }>();

  for (const product of syncProducts) {
    details.set(product.id, await getSyncProduct(product.id));
  }

  const rows: AuditRow[] = [];
  for (const product of core) {
    const matches = syncProducts.filter((candidate) => normalize(candidate.name) === normalize(product.name));
    for (const variant of product.variants) {
      const match = matches
        .flatMap((candidate) => details.get(candidate.id)?.sync_variants || [])
        .find((candidate) =>
          normalize(candidate.size || '') === normalize(variant.size) &&
          normalize(candidate.color || '') === normalize(variant.color) &&
          candidate.synced !== false &&
          candidate.availability_status !== 'out_of_stock' &&
          candidate.availability_status !== 'discontinued'
        );

      if (!match) {
        rows.push({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          variantId: variant.id,
          size: variant.size,
          color: variant.color,
          status: 'unavailable',
          reason: matches.length ? 'No verified Printful Sync Variant matches size/color' : 'No exact Printful Sync Product name match',
        });
        continue;
      }

      const syncProduct = details.get(match.sync_product_id)?.sync_product;
      rows.push({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        variantId: variant.id,
        size: variant.size,
        color: variant.color,
        status: 'verified',
        syncProductId: match.sync_product_id,
        syncProductName: syncProduct?.name,
        syncVariantId: match.id,
        catalogVariantId: match.variant_id,
        sku: match.sku,
      });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    coreListings: core.length,
    variants: rows.length,
    verified: rows.filter((row) => row.status === 'verified').length,
    unavailable: rows.filter((row) => row.status === 'unavailable').length,
    rows,
  };

  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
