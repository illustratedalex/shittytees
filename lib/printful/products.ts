import { printfulRequest } from './client';
import {
  PrintfulStoreInfo,
  PrintfulStoreProduct,
  PrintfulStoreProductsPage,
  PrintfulSyncProduct,
  PrintfulSyncProductDetail,
  PrintfulSyncVariantInfo,
  PrintfulSyncVariant,
} from './types';

export async function getStoreInfo(): Promise<PrintfulStoreInfo> {
  return (await printfulRequest<PrintfulStoreInfo>('/store', { method: 'GET' })).result;
}

export async function getSyncProducts(): Promise<PrintfulSyncProduct[]> {
  return (await printfulRequest<PrintfulSyncProduct[]>('/sync/products', { method: 'GET' })).result;
}

export async function getStoreProductsPage(offset = 0, limit = 100): Promise<PrintfulStoreProductsPage> {
  const response = await printfulRequest<PrintfulStoreProduct[]>(`/sync/products?offset=${offset}&limit=${limit}`, { method: 'GET' });
  const payload = response as unknown as PrintfulStoreProductsPage;
  return {
    result: payload.result || [],
    paging: payload.paging || { total: payload.result?.length || 0, offset, limit },
  };
}

export async function getStoreProducts(): Promise<PrintfulStoreProduct[]> {
  const all: PrintfulStoreProduct[] = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const page = await getStoreProductsPage(offset, limit);
    all.push(...page.result);

    const nextOffset = page.paging.offset + page.paging.limit;
    if (nextOffset >= page.paging.total || page.result.length === 0) {
      break;
    }
    offset = nextOffset;
  }

  return all;
}

export async function getStoreProduct(id: number): Promise<PrintfulSyncProductDetail> {
  return (await printfulRequest<PrintfulSyncProductDetail>(`/sync/products/${id}`, { method: 'GET' })).result;
}

export async function getSyncProduct(id: number): Promise<PrintfulSyncProductDetail> {
  return (await printfulRequest<PrintfulSyncProductDetail>(`/sync/products/${id}`, { method: 'GET' })).result;
}

export async function getSyncVariant(variantId: number): Promise<PrintfulSyncVariant> {
  const response = await printfulRequest<PrintfulSyncVariantInfo>(`/sync/variant/${variantId}`, { method: 'GET' });
  return response.result.sync_variant;
}

export async function getAvailableProducts(): Promise<PrintfulSyncProduct[]> {
  const products = await getSyncProducts();
  return products.filter((product) => (product.variants_count || product.variants || 0) > 0 && !product.is_ignored);
}
