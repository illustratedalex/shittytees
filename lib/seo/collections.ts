/** New Arrivals lists the same public shirts as /shop, so it should not be a second indexable URL. */
export const SHOP_DUPLICATE_COLLECTION = 'new-arrivals';

export function collectionCanonicalPath(slug: string): string {
  return slug === SHOP_DUPLICATE_COLLECTION ? '/shop' : `/collections/${slug}`;
}

export function collectionIsIndexable(productCount: number): boolean {
  return productCount > 0;
}

export function includeCollectionInSitemap(slug: string, productCount: number): boolean {
  return collectionIsIndexable(productCount) && slug !== SHOP_DUPLICATE_COLLECTION;
}
