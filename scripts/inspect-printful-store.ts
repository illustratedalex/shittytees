import { ensureScriptEnvLoaded } from './load-env';

type ConnectionCategory =
  | 'token missing'
  | 'malformed token'
  | 'unauthorized / 401'
  | 'forbidden / 403'
  | 'store mismatch'
  | 'API endpoint mismatch'
  | 'DNS/network failure'
  | 'timeout'
  | 'Printful API error';

type ProductInspection = {
  name: string;
  syncProductId: number;
  externalId: string | null;
  variantCount: number;
  sizes: string[];
  colors: string[];
  skuAvailable: number;
  skuMissing: number;
  mockupAvailable: number;
  mockupMissing: number;
  activeVariants: number;
  inactiveVariants: number;
};

type ConnectionDiagnostics = {
  ok: boolean;
  category?: ConnectionCategory;
  message?: string;
  httpStatus?: number;
  storeName?: string;
  productsReturned?: number;
};

function parseBoolean(value?: string): string {
  return value === 'true' || value === '1' ? 'yes' : 'no';
}

function isMalformedToken(token?: string): boolean {
  if (!token) return false;
  if (/\s/.test(token)) return true;
  if (token.length < 20) return true;
  return false;
}

function hasMockup(variant: { mockup_url?: string; files?: Array<{ type?: string; url?: string }> }): boolean {
  if (variant.mockup_url) return true;
  return Boolean(variant.files?.some((file) => file.type?.toLowerCase().includes('mockup') || file.url));
}

function uniqueSorted(values: Array<string | undefined>): string[] {
  return [...new Set(values.filter((v): v is string => Boolean(v && v.trim())).map((v) => v.trim()))].sort((a, b) => a.localeCompare(b));
}

function formatMessage(message: string): string {
  return message.replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [redacted]');
}

function categorizeFailure(error: unknown): { category: ConnectionCategory; message: string; httpStatus?: number } {
  if (error instanceof Error) {
    const message = error.message || '';
    const anyError = error as Error & { status?: number; cause?: unknown };
    const status = typeof anyError.status === 'number' ? anyError.status : undefined;

    if (status === 401) {
      return { category: 'unauthorized / 401', message: formatMessage(message), httpStatus: 401 };
    }
    if (status === 403) {
      return { category: 'forbidden / 403', message: formatMessage(message), httpStatus: 403 };
    }
    if (status === 404 && message.includes('/store')) {
      return { category: 'store mismatch', message: formatMessage(message), httpStatus: 404 };
    }
    if (status === 404) {
      return { category: 'API endpoint mismatch', message: formatMessage(message), httpStatus: 404 };
    }
    if (message.toLowerCase().includes('timeout') || message.toLowerCase().includes('timed out')) {
      return { category: 'timeout', message: formatMessage(message) };
    }

    const causeCode =
      typeof anyError.cause === 'object' && anyError.cause !== null && 'code' in anyError.cause
        ? String((anyError.cause as { code?: string }).code)
        : undefined;

    if (causeCode && ['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT'].includes(causeCode)) {
      return { category: 'DNS/network failure', message: formatMessage(message) };
    }

    if (message.toLowerCase().includes('fetch failed')) {
      return { category: 'DNS/network failure', message: formatMessage(message) };
    }

    if (typeof status === 'number') {
      return { category: 'Printful API error', message: formatMessage(message), httpStatus: status };
    }

    return { category: 'Printful API error', message: formatMessage(message) };
  }

  return { category: 'Printful API error', message: 'Unknown error' };
}

async function inspectRemoteProducts(): Promise<{
  diagnostics: ConnectionDiagnostics;
  products: ProductInspection[];
}> {
  const { getSyncProducts, getSyncProduct, getStoreInfo } = await import('@/lib/printful/products');
  const { printfulRequest } = await import('@/lib/printful/client');
  const { getPrintfulEnv } = await import('@/lib/printful/env');

  try {
    const products = await getSyncProducts();
    const env = getPrintfulEnv();
    const inspected: ProductInspection[] = [];

    let storeName: string | undefined;
    try {
      const store = await getStoreInfo();
      storeName = store.name;
    } catch {
      try {
        const stores = await printfulRequest<Array<{ id: number; name: string }>>('/stores', { method: 'GET' });
        const match = stores.result.find((store) => String(store.id) === String(env.storeId));
        storeName = match?.name;
      } catch {
        storeName = undefined;
      }
    }

    for (const product of products) {
      let detailProduct = product;
      let variants: Array<{
        sku?: string;
        size?: string;
        color?: string;
        is_discontinued?: boolean;
        mockup_url?: string;
        files?: Array<{ type?: string; url?: string }>;
      }> = [];

      try {
        const detail = await getSyncProduct(product.id);
        detailProduct = detail.sync_product;
        variants = detail.sync_variants || [];
      } catch {
        detailProduct = product;
        variants = [];
      }
      const sizes = uniqueSorted(variants.map((variant) => variant.size));
      const colors = uniqueSorted(variants.map((variant) => variant.color));
      const skuAvailable = variants.filter((variant) => Boolean(variant.sku && variant.sku.trim())).length;
      const mockupAvailable = variants.filter((variant) => hasMockup(variant)).length;
      const inactiveVariants = variants.filter((variant) => variant.is_discontinued === true).length;

      inspected.push({
        name: detailProduct.name,
        syncProductId: detailProduct.id,
        externalId: detailProduct.external_id || null,
        variantCount: variants.length,
        sizes,
        colors,
        skuAvailable,
        skuMissing: variants.length - skuAvailable,
        mockupAvailable,
        mockupMissing: variants.length - mockupAvailable,
        activeVariants: variants.length - inactiveVariants,
        inactiveVariants,
      });
    }

    return {
      diagnostics: {
        ok: true,
        storeName,
        productsReturned: products.length,
      },
      products: inspected,
    };
  } catch (error) {
    const failure = categorizeFailure(error);
    return {
      diagnostics: {
        ok: false,
        category: failure.category,
        message: failure.message,
        httpStatus: failure.httpStatus,
      },
      products: [],
    };
  }
}

function printProduct(product: ProductInspection): void {
  console.log(`- Name: ${product.name}`);
  console.log(`  Sync Product ID: ${product.syncProductId}`);
  console.log(`  External ID: ${product.externalId || 'none'}`);
  console.log(`  Variant count: ${product.variantCount}`);
  console.log(`  Sizes: ${product.sizes.length ? product.sizes.join(', ') : 'none'}`);
  console.log(`  Colors: ${product.colors.length ? product.colors.join(', ') : 'none'}`);
  console.log(`  SKU availability: ${product.skuAvailable}/${product.variantCount}`);
  console.log(`  Mockup image availability: ${product.mockupAvailable}/${product.variantCount}`);
  console.log(`  Active variants: ${product.activeVariants}`);
  console.log(`  Inactive variants: ${product.inactiveVariants}`);
}

async function main() {
  ensureScriptEnvLoaded();

  const { getPrintfulEnv } = await import('@/lib/printful/env');
  const { getPrintfulMappingReport, getPrintfulMappingSummary } = await import('@/lib/printful/mappers');

  const env = getPrintfulEnv();
  const storeIdParsed = Number.isInteger(Number(env.storeId));
  const tokenConfigured = Boolean(env.apiToken);
  const storeConfigured = Boolean(env.storeId);
  const tokenMalformed = isMalformedToken(env.apiToken);
  const diagnosticsMode = process.argv.includes('--diagnostic');

  console.log('Printful credentials');
  console.log(`PRINTFUL_API_TOKEN present: ${tokenConfigured}`);
  console.log(`PRINTFUL_STORE_ID present: ${storeConfigured}`);
  console.log(`PRINTFUL_STORE_ID parsed: ${storeIdParsed}`);
  console.log(`Token configured: ${tokenConfigured ? 'yes' : 'no'}`);
  console.log(`Store ID configured: ${storeConfigured ? 'yes' : 'no'}`);
  console.log(`Store ID: ${env.storeId || 'missing'}`);
  console.log(`Fulfillment enabled: ${parseBoolean(process.env.PRINTFUL_ENABLE_FULFILLMENT)}`);
  console.log(`Test orders enabled: ${parseBoolean(process.env.PRINTFUL_ENABLE_TEST_ORDERS)}`);

  const mappingReport = getPrintfulMappingReport();
  console.log('');
  console.log('Local mapping');
  console.log(`Products: ${mappingReport.products}`);
  console.log(`Variants: ${mappingReport.variants}`);
  console.log(`Summary: ${getPrintfulMappingSummary()}`);

  if (!tokenConfigured) {
    console.log('');
    console.log('Remote connectivity: no');
    console.log('Failure category: token missing');
    console.log('Failure detail: PRINTFUL_API_TOKEN is missing');
    process.exitCode = 1;
    return;
  }

  if (tokenMalformed) {
    console.log('');
    console.log('Remote connectivity: no');
    console.log('Failure category: malformed token');
    console.log('Failure detail: PRINTFUL_API_TOKEN format looks invalid');
    process.exitCode = 1;
    return;
  }

  if (!storeConfigured || !storeIdParsed) {
    console.log('');
    console.log('Remote connectivity: no');
    console.log('Failure category: store mismatch');
    console.log('Failure detail: PRINTFUL_STORE_ID is missing or invalid');
    process.exitCode = 1;
    return;
  }

  const remote = await inspectRemoteProducts();
  console.log('');
  console.log(`Remote connectivity: ${remote.diagnostics.ok ? 'yes' : 'no'}`);

  if (!remote.diagnostics.ok) {
    console.log(`Failure category: ${remote.diagnostics.category}`);
    console.log(`Failure detail: ${remote.diagnostics.message || 'Unknown failure'}`);
    if (remote.diagnostics.httpStatus) {
      console.log(`HTTP status: ${remote.diagnostics.httpStatus}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`HTTP result: success`);
  console.log(`Store`);
  console.log(`Name: ${remote.diagnostics.storeName || 'unknown'}`);
  console.log(`ID: ${env.storeId}`);
  console.log(`Products: ${remote.diagnostics.productsReturned ?? remote.products.length}`);

  console.log('');
  console.log('Products');
  for (const product of remote.products) {
    printProduct(product);
  }

  if (diagnosticsMode) {
    console.log('');
    console.log('Diagnostic mode: enabled');
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
