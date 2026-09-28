import { DEMO_PRODUCTS } from '@/lib/data/products';
import { printfulRequest } from '@/lib/printful/client';
import { getPrintfulEnv } from '@/lib/printful/env';
import { PrintfulError } from '@/lib/printful/errors';

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
type StoreSummary = { id: number; type: string; name: string };

type PrintfulDiagnostic = {
  status: number;
  code?: number;
  message: string;
};

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

function sanitizeMessage(message: string): string {
  return message
    .replace(/Bearer\\s+[^\\s]+/gi, 'Bearer [REDACTED]')
    .replace(/[A-Za-z0-9_-]{32,}/g, '[REDACTED]')
    .slice(0, 500);
}

export function diagnosticFromError(error: unknown): PrintfulDiagnostic {
  if (error instanceof PrintfulError) {
    return {
      status: error.status ?? 0,
      code: error.code,
      message: sanitizeMessage(error.message),
    };
  }
  return { status: 0, message: sanitizeMessage(error instanceof Error ? error.message : 'Unknown error') };
}

async function verifyStoreAccess(): Promise<{ accessible: boolean; intendedStoreMatched: boolean }> {
  const env = getPrintfulEnv();
  const response = await printfulRequest<StoreSummary[]>('/stores', { method: 'GET' });
  return {
    accessible: true,
    intendedStoreMatched: response.result.some((store) => String(store.id) === env.storeId),
  };
}

async function listSyncProducts(): Promise<SyncProduct[]> {
  const response = await printfulRequest<SyncProduct[]>('/sync/products?offset=0&limit=100', { method: 'GET' });
  return response.result;
}

async function getSyncProduct(id: number): Promise<{ sync_product: SyncProduct; sync_variants: SyncVariant[] }> {
  return (await printfulRequest<{ sync_product: SyncProduct; sync_variants: SyncVariant[] }>(`/store/products/${id}`, { method: 'GET' })).result;
}

export async function runAudit() {
  const core = DEMO_PRODUCTS.filter((product) => product.id.startsWith('prod-'));
  if (core.length !== 20) {
    throw new Error(`Expected 20 core listings, found ${core.length}`);
  }

  const storeAccess = await verifyStoreAccess();
  if (!storeAccess.intendedStoreMatched) {
    throw new PrintfulError('Printful token cannot access the configured store', { status: 403, code: 403 });
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
    printfulStoreAccess: storeAccess,
  };

  return report;
}

if (process.env.PRINTFUL_AUDIT_RUN_ON_BUILD === 'true') {
  runAudit()
    .then((report) => console.log(JSON.stringify(report, null, 2)))
    .catch((error) => {
      console.error(JSON.stringify({ printfulError: diagnosticFromError(error) }));
      process.exit(1);
    });
}
