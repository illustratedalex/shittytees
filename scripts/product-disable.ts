import { getAllProducts } from '@/lib/data/products';
import { loadStatusOverrides, parseSlugArg, saveStatusOverrides } from './product-status-helpers';
import { loadPublishedProducts, savePublishedProducts } from './new-product-helpers';
import { disableProductLocally } from '@/lib/printful/newProductPipeline';

async function main() {
  const slug = parseSlugArg();
  const product = getAllProducts().find((item) => item.slug === slug);
  if (!product) {
    throw new Error(`Product not found: ${slug}`);
  }

  const overrides = await loadStatusOverrides();
  overrides[slug] = 'disabled';
  await saveStatusOverrides(overrides);

  const published = await loadPublishedProducts();
  const publishedIndex = published.findIndex((item) => item.slug === slug);
  if (publishedIndex >= 0) {
    published[publishedIndex] = disableProductLocally(published[publishedIndex]);
    await savePublishedProducts(published);
  }

  console.log(JSON.stringify({ action: 'disable', slug, status: 'disabled' }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
