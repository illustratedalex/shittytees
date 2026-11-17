import type { Product } from '@/lib/types/product';

function byNewest(left: Product, right: Product): number {
  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
}

function hasTag(product: Product, tag: string): boolean {
  return Array.isArray(product.tags) && product.tags.includes(tag);
}

export function selectProductsForCollection(products: Product[], collectionSlug: string): Product[] {
  if (collectionSlug === 'drop-001') {
    return products.filter((product) => hasTag(product, 'drop-001'));
  }

  if (collectionSlug === 'new-arrivals') {
    return products
      .filter((product) => product.publishStatus === 'published' && hasTag(product, 'new-arrival'))
      .sort(byNewest);
  }

  if (collectionSlug === 'best-sellers') {
    return products.filter((product) => product.publishStatus === 'published' && hasTag(product, 'best-seller'));
  }

  return products.filter((product) => product.collectionSlug === collectionSlug);
}
