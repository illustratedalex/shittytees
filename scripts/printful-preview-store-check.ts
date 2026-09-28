import { printfulRequest } from '@/lib/printful/client';
import { getPrintfulEnv } from '@/lib/printful/env';
import { diagnosticFromError } from './audit-printful-mappings';

type SyncProduct = { id: number; name: string; variants: number; synced: number };
type SyncProductDetail = { sync_product: SyncProduct; sync_variants: unknown[] };

async function run() {
  const env = getPrintfulEnv();
  const storeMatches = env.storeId === '7561356';

  let listStatus: number;
  let products: SyncProduct[] = [];

  try {
    const response = await printfulRequest<SyncProduct[]>('/sync/products?offset=0&limit=100', { method: 'GET' });
    listStatus = response.code;
    products = response.result;
  } catch (error) {
    const diagnostic = diagnosticFromError(error);
    console.log(JSON.stringify({
      storeIdMatches7561356: storeMatches,
      syncProducts: {
        status: diagnostic.status,
        productCount: null,
        error: { code: diagnostic.code, message: diagnostic.message },
      },
      syncProductDetail: null,
    }, null, 2));
    return;
  }

  if (products.length === 0) {
    console.log(JSON.stringify({
      storeIdMatches7561356: storeMatches,
      syncProducts: { status: listStatus, productCount: 0 },
      syncProductDetail: null,
    }, null, 2));
    return;
  }

  const product = products[0];
  try {
    const response = await printfulRequest<SyncProductDetail>(`/store/products/${product.id}`, { method: 'GET' });
    console.log(JSON.stringify({
      storeIdMatches7561356: storeMatches,
      syncProducts: { status: listStatus, productCount: products.length },
      syncProductDetail: { status: response.code, variantCount: response.result.sync_variants.length },
    }, null, 2));
  } catch (error) {
    const diagnostic = diagnosticFromError(error);
    console.log(JSON.stringify({
      storeIdMatches7561356: storeMatches,
      syncProducts: { status: listStatus, productCount: products.length },
      syncProductDetail: {
        status: diagnostic.status,
        variantCount: null,
        error: { code: diagnostic.code, message: diagnostic.message },
      },
    }, null, 2));
  }
}

run().catch((error) => {
  const diagnostic = diagnosticFromError(error);
  console.log(JSON.stringify({
    storeIdMatches7561356: false,
    syncProducts: null,
    syncProductDetail: null,
    error: { code: diagnostic.code, message: diagnostic.message },
  }, null, 2));
  process.exit(1);
});
