import { isStorefrontProductReady } from '@/lib/products/storefrontReadiness';
import { COLLECTIONS } from '@/lib/data/products';
import type { Collection, Product } from '@/lib/types/product';
import { selectProductsForCollection } from './collectionMembership';
import { getCatalogRepository } from './index';

export async function getPublicProducts(): Promise<Product[]> {
  const repository = getCatalogRepository();
  return (await repository.listPublic()).filter(isStorefrontProductReady);
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
  return selectProductsForCollection(await getPublicProducts(), collectionSlug);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function getAllCollections(): Collection[] {
  return COLLECTIONS;
}
