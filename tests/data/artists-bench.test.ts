import { describe, expect, it } from 'vitest';
import { generateMetadata, getCollectionPageState } from '@/app/collections/[slug]/page';
import { getAllProducts, getCollectionBySlug, getProductsByCollection, getPublicProducts } from '@/lib/data/products';
import { validateAndNormalizeCheckoutItems } from '@/lib/orders/services/checkoutSecurity';
import { buildReviewSections } from '@/scripts/products-review';

describe("Artist's Bench collection", () => {
  it('resolves the canonical collection and keeps the slug unique', () => {
    const collection = getCollectionBySlug('artists-bench');
    const allSlugs = getAllProducts().map((product) => product.slug);

    expect(collection?.name).toBe("Artist's Bench");
    expect(allSlugs.filter((slug) => slug === 'artists-bench')).toHaveLength(1);
  });

  it('does not expose draft concepts in the public shop or new arrivals', () => {
    const draftSlugs = getAllProducts()
      .filter((product) => product.collectionSlug === 'artists-bench')
      .map((product) => product.slug);
    const publicSlugs = new Set(getPublicProducts().map((product) => product.slug));
    const newArrivalSlugs = new Set(getProductsByCollection('new-arrivals').map((product) => product.slug));

    expect(draftSlugs.length).toBe(6);
    expect(draftSlugs.every((slug) => !publicSlugs.has(slug))).toBe(true);
    expect(draftSlugs.every((slug) => !newArrivalSlugs.has(slug))).toBe(true);
  });

  it('cannot be checked out because collection products are not public yet', async () => {
    const product = getAllProducts().find((item) => item.collectionSlug === 'artists-bench');
    expect(product).toBeDefined();

    const variant = product!.variants[0];
    await expect(validateAndNormalizeCheckoutItems([{
      productId: product!.id,
      variantId: variant.id,
      quantity: 1,
      name: product!.name,
      image: product!.images[0].src,
      size: variant.size,
      color: variant.color,
      unitPrice: variant.retailPrice,
      printfulVariantId: variant.printfulVariantId,
    }])).rejects.toThrow('Unknown product');
  });

  it('shows a coming-soon state for the collection route with zero public products', async () => {
    const state = await getCollectionPageState('artists-bench');
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: 'artists-bench' }) });

    expect(state.collection?.name).toBe("Artist's Bench");
    expect(state.isComingSoon).toBe(true);
    expect(state.products).toHaveLength(0);
    expect(metadata.title).toBe("Artist's Bench | ShittyTees");
    expect(metadata.description).toBe('Original ShittyTees apparel inspired by sketchbooks, tattoo shops, late nights, and the people who make things by hand.');
  });

  it('lists Artist\'s Bench drafts in products review output', () => {
    const review = buildReviewSections(getAllProducts(), []);
    const drafts = review.find((section) => section.title === "ARTIST'S BENCH — DRAFT CONCEPTS");

    expect(drafts).toBeDefined();
    expect(drafts?.lines).toHaveLength(6);
    expect(drafts?.lines.every((line) => line.includes('status: draft'))).toBe(true);
    expect(drafts?.lines.every((line) => line.includes('Printful mapping: missing'))).toBe(true);
    expect(drafts?.lines.every((line) => line.includes('mockup: missing'))).toBe(true);
    expect(drafts?.lines.every((line) => line.includes('fulfillment ready: no'))).toBe(true);
  });

  it('keeps archive hidden while preserving Drop 001 behavior', async () => {
    const archiveState = await getCollectionPageState('archive');
    const dropProducts = getProductsByCollection('drop-001');

    expect(archiveState.isComingSoon).toBe(false);
    expect(archiveState.products.length).toBe(0);
    expect(dropProducts.every((product) => product.collectionSlug !== 'artists-bench')).toBe(true);
  });
});