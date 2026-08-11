import publishedProductsJson from './publishedProducts.json';
import type { Product } from '@/lib/types/product';

type StoredPublishedProduct = Omit<Product, 'createdAt' | 'updatedAt'> & {
  createdAt: string;
  updatedAt: string;
};

function hydrateProduct(product: StoredPublishedProduct): Product {
  return {
    ...product,
    createdAt: new Date(product.createdAt),
    updatedAt: new Date(product.updatedAt),
  };
}

export function toStoredPublishedProduct(product: Product): StoredPublishedProduct {
  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };
}

export const PUBLISHED_PRODUCTS = (publishedProductsJson as StoredPublishedProduct[]).map(hydrateProduct);
