import { printfulRequest } from './client';
import { PrintfulProduct, PrintfulVariant } from '../types/printful';

export async function getSyncProducts(): Promise<PrintfulProduct[]> {
  const response = await printfulRequest<PrintfulProduct[]>('/sync/products', {
    method: 'GET',
  });

  return response.result;
}

export async function getSyncProduct(id: number): Promise<PrintfulProduct> {
  const response = await printfulRequest<PrintfulProduct>(`/sync/products/${id}`, {
    method: 'GET',
  });

  return response.result;
}

export async function getSyncVariant(variantId: number): Promise<PrintfulVariant> {
  const response = await printfulRequest<PrintfulVariant>(`/sync/variants/${variantId}`, {
    method: 'GET',
  });

  return response.result;
}

export async function getAvailableProducts(): Promise<PrintfulProduct[]> {
  const products = await getSyncProducts();
  return products.filter((p) => p.variants_count > 0);
}
