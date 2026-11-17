import { describe, expect, it } from 'vitest';
import { generateMetadata, getCollectionPageState } from '@/app/collections/[slug]/page';
import { collectionCanonicalPath, collectionIsIndexable, includeCollectionInSitemap } from '@/lib/seo/collections';

describe('collection indexing', () => {
  it('hides empty collections and the shop duplicate from the sitemap', () => {
    expect(includeCollectionInSitemap('dark-humor', 0)).toBe(false);
    expect(includeCollectionInSitemap('shitty-politics', 2)).toBe(true);
    expect(includeCollectionInSitemap('new-arrivals', 14)).toBe(false);
    expect(collectionIsIndexable(0)).toBe(false);
    expect(collectionCanonicalPath('new-arrivals')).toBe('/shop');
    expect(collectionCanonicalPath('shitty-relationships')).toBe('/collections/shitty-relationships');
  });

  it('points New Arrivals at the shop and noindexes a collection with no shirts', async () => {
    const arrivals = await getCollectionPageState('new-arrivals');
    const arrivalsMetadata = await generateMetadata({ params: Promise.resolve({ slug: 'new-arrivals' }) });
    const emptyMetadata = await generateMetadata({ params: Promise.resolve({ slug: 'holiday-damage' }) });

    expect(arrivalsMetadata.alternates).toEqual({ canonical: '/shop' });
    expect(arrivalsMetadata.robots).toEqual({
      index: arrivals.products.length > 0,
      follow: true,
    });
    expect(emptyMetadata.robots).toEqual({ index: false, follow: true });
    expect(emptyMetadata.alternates).toEqual({ canonical: '/collections/holiday-damage' });
  });
});
