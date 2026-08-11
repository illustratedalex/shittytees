import { getAllProducts } from '@/lib/data/products';
import { getProductStatusOverride } from '@/data/productStatus';
import { pathToFileURL } from 'url';
import { loadNewCandidates } from './new-product-helpers';

export type ReviewSection = {
  title: string;
  lines: string[];
};

function printSection(title: string, lines: string[]) {
  console.log(`\n${title}`);
  if (!lines.length) {
    console.log('- none');
    return;
  }
  for (const line of lines) {
    console.log(`- ${line}`);
  }
}

export function buildReviewSections(localProducts: ReturnType<typeof getAllProducts>, candidates: Awaited<ReturnType<typeof loadNewCandidates>>): ReviewSection[] {
  const localSlugs = new Set(localProducts.map((product) => product.slug));
  const localSkus = new Set(
    localProducts
      .flatMap((product) => product.variants)
      .map((variant) => variant.sku)
      .filter((sku): sku is string => Boolean(sku && sku.trim())),
  );

  const skuCounts = new Map<string, number>();
  for (const candidate of candidates) {
    for (const variant of candidate.variants) {
      if (!variant.active || !variant.sku) continue;
      skuCounts.set(variant.sku, (skuCounts.get(variant.sku) || 0) + 1);
    }
  }

  const ready = candidates.filter((candidate) => candidate.readiness === 'ready').map((candidate) => `${candidate.proposedSlug} (${candidate.title})`);
  const missingPrice = candidates.filter((candidate) => candidate.readiness === 'missing-price').map((candidate) => candidate.proposedSlug);
  const missingVariants = candidates.filter((candidate) => candidate.readiness === 'missing-variant').map((candidate) => candidate.proposedSlug);
  const missingMockups = candidates.filter((candidate) => candidate.readiness === 'missing-mockup').map((candidate) => candidate.proposedSlug);

  const slugConflicts = candidates
    .filter((candidate) => localSlugs.has(candidate.proposedSlug) || candidate.readiness === 'ambiguous')
    .map((candidate) => candidate.proposedSlug);

  const skuConflicts = candidates
    .flatMap((candidate) => candidate.variants.map((variant) => ({ candidate: candidate.proposedSlug, sku: variant.sku, active: variant.active })))
    .filter((entry) => entry.active && entry.sku && (localSkus.has(entry.sku) || (skuCounts.get(entry.sku) || 0) > 1))
    .map((entry) => `${entry.candidate}: ${entry.sku}`);

  const archiveProducts = localProducts
    .filter((product) => {
      const effective = getProductStatusOverride(product.slug) || product.publishStatus;
      return effective === 'archive' || product.collectionSlug === 'archive';
    })
    .map((product) => product.slug)
    .sort((a, b) => a.localeCompare(b));

  const artistsBenchDrafts = localProducts
    .filter((product) => product.collectionSlug === 'artists-bench')
    .filter((product) => (getProductStatusOverride(product.slug) || product.publishStatus) === 'draft')
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((product) => `${product.name} | ${product.slug} | status: draft | Printful mapping: missing | mockup: missing | fulfillment ready: no`);

  return [
    { title: 'READY TO PUBLISH', lines: ready },
    { title: 'Products missing price', lines: missingPrice },
    { title: 'Products missing variants', lines: missingVariants },
    { title: 'Products missing mockups', lines: missingMockups },
    { title: 'Slug conflicts', lines: [...new Set(slugConflicts)].sort((a, b) => a.localeCompare(b)) },
    { title: 'SKU conflicts', lines: [...new Set(skuConflicts)].sort((a, b) => a.localeCompare(b)) },
    { title: 'ARTIST\'S BENCH — DRAFT CONCEPTS', lines: artistsBenchDrafts },
    { title: 'Archive products', lines: archiveProducts },
  ];
}

async function main() {
  const localProducts = getAllProducts();
  const candidates = await loadNewCandidates();

  for (const section of buildReviewSections(localProducts, candidates)) {
    printSection(section.title, section.lines);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
