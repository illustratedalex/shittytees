import { getAllProducts } from '@/lib/data/products';
import {
  createPublishedProductFromCandidate,
  loadCandidateMappings,
  loadNewCandidates,
  loadPublishedMappings,
  loadPublishedProducts,
  saveCandidateMappings,
  saveNewCandidates,
  savePublishedMappings,
  savePublishedProducts,
} from './new-product-helpers';
import { parseSlugArg } from './product-status-helpers';
import { validateCandidateForPublish } from '@/lib/printful/newProductPipeline';

async function main() {
  const slug = parseSlugArg();
  const existingProducts = getAllProducts();
  const candidatePool = await loadNewCandidates();
  const candidate = candidatePool.find((item) => item.proposedSlug === slug);
  if (!candidate) throw new Error(`Candidate not found: ${slug}`);

  const candidateMappings = await loadCandidateMappings();
  const mapping = candidateMappings.find((item) => item.slug === slug);
  const validation = validateCandidateForPublish(candidate, existingProducts, mapping);
  if (!validation.ok) {
    throw new Error(`Publication blocked: ${validation.errors.join(', ')}`);
  }

  const product = createPublishedProductFromCandidate(candidate);
  const publishedProducts = await loadPublishedProducts();
  publishedProducts.push(product);
  await savePublishedProducts(publishedProducts);

  const nextCandidates = candidatePool.filter((item) => item.proposedSlug !== slug);
  await saveNewCandidates(nextCandidates);

  const publishedMappings = await loadPublishedMappings();
  if (!mapping) {
    throw new Error(`Publication blocked: missing candidate mapping for ${slug}`);
  }
  publishedMappings.push(mapping);
  await savePublishedMappings(publishedMappings);

  const nextCandidateMappings = candidateMappings.filter((item) => item.slug !== slug);
  await saveCandidateMappings(nextCandidateMappings);

  console.log(
    JSON.stringify(
      {
        action: 'publish',
        slug,
        status: 'published',
        productId: product.id,
        moved: {
          removedFromCandidates: true,
          addedToPublishedProducts: true,
          promotedMapping: true,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
