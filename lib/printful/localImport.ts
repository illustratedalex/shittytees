import { Product } from '@/lib/types/product';
import { ImportedPrintfulProduct } from '@/data/printfulImportedCatalog';
import { PrintfulProductMapping } from '@/data/printfulMappings';

export type MatchClassification = 'MATCHED' | 'UNMATCHED_LOCAL' | 'UNMATCHED_PRINTFUL' | 'AMBIGUOUS';

export type RemoteMatchResult = {
  remoteSlug: string;
  remoteName: string;
  classification: MatchClassification;
  matchedLocalSlugs: string[];
  reason: string;
};

export function chooseMockupUrls(product: ImportedPrintfulProduct): {
  front?: string;
  back?: string;
  alternate: string[];
} {
  const variantFront = product.variants.map((v) => v.mockupFrontUrl).find(Boolean);
  const variantBack = product.variants.map((v) => v.mockupBackUrl).find(Boolean);
  const variantAlternates = product.variants.flatMap((v) => v.alternateMockupUrls || []);

  const front = product.mockupFrontUrl || product.mockupBackUrl || product.alternateMockupUrls[0] || variantFront;
  const back = product.mockupBackUrl || variantBack;
  const alternate = [...new Set([...(product.alternateMockupUrls || []), ...variantAlternates].filter(Boolean))] as string[];

  return { front, back, alternate };
}

export function detectDuplicateVariantMappings(mappings: PrintfulProductMapping[]): number[] {
  const seen = new Set<number>();
  const duplicates = new Set<number>();

  for (const mapping of mappings) {
    for (const variant of mapping.variants) {
      if (seen.has(variant.printfulVariantId)) {
        duplicates.add(variant.printfulVariantId);
      } else {
        seen.add(variant.printfulVariantId);
      }
    }
  }

  return [...duplicates].sort((a, b) => a - b);
}

export function classifyRemoteAgainstLocal(
  remoteProducts: ImportedPrintfulProduct[],
  localProducts: Product[],
  mappings: PrintfulProductMapping[],
): {
  remote: RemoteMatchResult[];
  unmatchedLocalSlugs: string[];
} {
  const results: RemoteMatchResult[] = [];

  for (const remote of remoteProducts) {
    const candidateSlugs = new Set<string>();

    const skuSet = new Set(remote.variants.map((variant) => variant.sku).filter(Boolean));
    for (const local of localProducts) {
      if (local.variants.some((variant) => skuSet.has(variant.sku))) {
        candidateSlugs.add(local.slug);
      }
    }

    if (remote.externalId) {
      for (const local of localProducts) {
        if ((local.printfulProductId || '') === remote.externalId) {
          candidateSlugs.add(local.slug);
        }
      }
    }

    for (const mapping of mappings) {
      if (mapping.syncProductId === remote.syncProductId || mapping.externalProductId === remote.externalId) {
        candidateSlugs.add(mapping.slug);
      }
    }

    const matches = [...candidateSlugs];

    if (matches.length === 0) {
      results.push({
        remoteSlug: remote.slug,
        remoteName: remote.name,
        classification: 'UNMATCHED_PRINTFUL',
        matchedLocalSlugs: [],
        reason: 'No SKU, external ID, or existing mapping match found.',
      });
      continue;
    }

    if (matches.length > 1) {
      results.push({
        remoteSlug: remote.slug,
        remoteName: remote.name,
        classification: 'AMBIGUOUS',
        matchedLocalSlugs: matches.sort(),
        reason: 'Multiple local candidates were found by non-title matching rules.',
      });
      continue;
    }

    results.push({
      remoteSlug: remote.slug,
      remoteName: remote.name,
      classification: 'MATCHED',
      matchedLocalSlugs: matches,
      reason: 'Matched via SKU, external ID, or existing mapping.',
    });
  }

  const matched = new Set(results.filter((item) => item.classification === 'MATCHED').flatMap((item) => item.matchedLocalSlugs));
  const unmatchedLocalSlugs = localProducts
    .filter((product) => !matched.has(product.slug))
    .map((product) => product.slug)
    .sort();

  return {
    remote: results,
    unmatchedLocalSlugs,
  };
}

export function requiresArchiveCollection(classification: RemoteMatchResult[]): boolean {
  return classification.some((entry) => entry.classification === 'UNMATCHED_PRINTFUL' || entry.classification === 'AMBIGUOUS');
}
