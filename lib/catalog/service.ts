import { COLLECTIONS } from '@/lib/data/products';
import type { Collection, Product } from '@/lib/types/product';
import { getCatalogRepository } from './index';

function byNewest(left: Product, right: Product): number {
  return right.createdAt.getTime() - left.createdAt.getTime();
}

export async function getPublicProducts(): Promise<Product[]> {
  const repository = getCatalogRepository();
  return repository.listPublic();
}

export async function getAllProducts(): Promise<Product[]> {
  const repository = getCatalogRepository();
  return repository.listAll();
}

export async function getPublicProductBySlug(slug: string): Promise<Product | undefined> {
  const repository = getCatalogRepository();
  return (await repository.getPublicBySlug(slug)) || undefined;
}

export async function getAnyProductBySlug(slug: string): Promise<Product | undefined> {
  const repository = getCatalogRepository();
  return (await repository.getBySlug(slug)) || undefined;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await getPublicProducts();
  return products.filter((product) => product.featured);
}

export async function getProductsByCollection(collectionSlug: string): Promise<Product[]> {
  const products = await getPublicProducts();

  if (collectionSlug === 'drop-001') {
    return products.filter((product) => product.tags.includes('drop-001'));
  }

  if (collectionSlug === 'new-arrivals') {
    return products.filter((product) => product.publishStatus === 'published' && product.tags.includes('new-arrival')).sort(byNewest);
  }

  if (collectionSlug === 'best-sellers') {
    return products.filter((product) => product.publishStatus === 'published' && product.tags.includes('best-seller'));
  }

  return products.filter((product) => product.collectionSlug === collectionSlug);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function getAllCollections(): Collection[] {
  return COLLECTIONS;
}
