import type { Product } from '@/lib/types/product';
import type { NewCandidate } from '@/data/newCandidates';
import type { NewCandidateProductMapping } from '@/data/newCandidatePrintfulMappings';

export type PublishValidation = {
  ok: boolean;
  errors: string[];
};

export function validateCandidateForPublish(
  candidate: NewCandidate,
  localProducts: Product[],
  mapping?: NewCandidateProductMapping,
): PublishValidation {
  const errors: string[] = [];

  if (localProducts.some((product) => product.slug === candidate.proposedSlug)) {
    errors.push('slug_conflict');
  }

  const activeVariants = candidate.variants.filter((variant) => variant.active);
  if (!activeVariants.length) {
    errors.push('missing_active_variant');
  }

  if (activeVariants.some((variant) => !variant.size || !variant.color)) {
    errors.push('missing_variant_data');
  }

  if (activeVariants.some((variant) => typeof variant.retailPrice !== 'number' || variant.retailPrice <= 0)) {
    errors.push('invalid_price');
  }

  if (!candidate.mockups.front) {
    errors.push('missing_mockup');
  }

  const localSkus = new Set(
    localProducts
      .flatMap((product) => product.variants)
      .map((variant) => variant.sku)
      .filter((sku): sku is string => Boolean(sku && sku.trim())),
  );

  if (activeVariants.some((variant) => variant.sku && localSkus.has(variant.sku))) {
    errors.push('sku_conflict');
  }

  if (!mapping) {
    errors.push('missing_mapping');
  } else {
    const mappedVariantIds = new Set(mapping.variants.map((variant) => variant.printfulVariantId));
    for (const variant of activeVariants) {
      if (!mappedVariantIds.has(variant.printfulSyncVariantId)) {
        errors.push('missing_variant_mapping');
        break;
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}

export function archiveProductLocally(product: Product): Product {
  return {
    ...product,
    publishStatus: 'archive',
    collectionSlug: 'archive',
    updatedAt: new Date(),
  };
}

export function disableProductLocally(product: Product): Product {
  return {
    ...product,
    publishStatus: 'disabled',
    active: false,
    updatedAt: new Date(),
  };
}
