import { NextResponse } from 'next/server';
import { printfulRequest } from '@/lib/printful/client';
import { getPrintfulEnv } from '@/lib/printful/env';
import { diagnosticFromError } from '@/scripts/audit-printful-mappings';

type StoreSummary = { id: number; type: string; name: string };
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

export async function GET() {
  try {
    const env = getPrintfulEnv();
    if (!env.apiToken || !env.storeId) {
      return NextResponse.json(
        { ok: false, error: 'PRINTFUL_API_TOKEN and PRINTFUL_STORE_ID are not configured in this Preview environment' },
        { status: 503 },
      );
    }

    const stores = await printfulRequest<StoreSummary[]>('/stores', { method: 'GET' });
    const store = stores.result.find((candidate) => String(candidate.id) === env.storeId);

    if (!store) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Configured Printful credentials cannot access the intended store',
          configuredStoreId: env.storeId,
          accessibleStoreIds: stores.result.map((candidate) => candidate.id),
        },
        { status: 403 },
      );
    }

    const products = await printfulRequest<SyncProduct[]>('/sync/products?offset=0&limit=1', { method: 'GET' });
    const first = products.result[0];

    if (!first) {
      return NextResponse.json({
        ok: true,
        store: { id: store.id, type: store.type, name: store.name },
        product: null,
        variants: [],
      });
    }

    const detail = await printfulRequest<{
      sync_product: SyncProduct;
      sync_variants: SyncVariant[];
    }>(`/sync/products/${first.id}`, { method: 'GET' });

    return NextResponse.json({
      ok: true,
      store: { id: store.id, type: store.type, name: store.name },
      product: detail.result.sync_product,
      variants: detail.result.sync_variants.map((variant) => ({
        id: variant.id,
        external_id: variant.external_id,
        sync_product_id: variant.sync_product_id,
        catalogVariantId: variant.variant_id,
        name: variant.name,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        availability_status: variant.availability_status,
        synced: variant.synced,
      })),
    });
  } catch (error) {
    const diagnostic = diagnosticFromError(error);
    return NextResponse.json(
      { ok: false, error: diagnostic },
      { status: diagnostic.status >= 400 && diagnostic.status < 600 ? diagnostic.status : 502 },
    );
  }
}
