import { getAllProducts } from '@/lib/data/products';
import { loadStatusOverrides, parseSlugArg, saveStatusOverrides } from './product-status-helpers';
import { loadNewCandidates, loadPublishedProducts, saveNewCandidates, savePublishedProducts } from './new-product-helpers';
import { archiveProductLocally } from '@/lib/printful/newProductPipeline';

async function main() {
  const slug = parseSlugArg();
  const product = getAllProducts().find((item) => item.slug === slug);
  if (!product) {
    throw new Error(`Product not found: ${slug}`);
  }

  const overrides = await loadStatusOverrides();
  overrides[slug] = 'archive';
  await saveStatusOverrides(overrides);

  const published = await loadPublishedProducts();
  const publishedIndex = published.findIndex((item) => item.slug === slug);
  if (publishedIndex >= 0) {
    published[publishedIndex] = archiveProductLocally(published[publishedIndex]);
    await savePublishedProducts(published);
  }

  const candidates = await loadNewCandidates();
  const nextCandidates = candidates.filter((item) => item.proposedSlug !== slug);
  if (nextCandidates.length !== candidates.length) {
    await saveNewCandidates(nextCandidates);
  }

  console.log(JSON.stringify({ action: 'archive', slug, status: 'archive' }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
