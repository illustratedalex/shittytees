import { ImportedPrintfulProduct as SnapshotProduct, IMPORTED_PRINTFUL_PRODUCTS } from '@/data/printfulImportedCatalog';
import { LEGACY_ARCHIVE_SYNC_PRODUCT_IDS } from '@/data/printfulArchiveSeed';
import { ProductPublishStatus } from '@/data/productStatus';
import { Product } from '@/lib/types/product';
import { PrintfulProductMapping } from '@/data/printfulMappings';

export type ImportedPrintfulProduct = {
  printfulSyncProductId: number;
  externalProductId?: string;
  name: string;
  description?: string;
  variants: Array<{
    printfulSyncVariantId: number;
    printfulVariantId: number;
    sku?: string;
    size: string;
    color: string;
    active: boolean;
    retailPrice?: number;
  }>;
  mockups: {
    front?: string;
    back?: string;
    alternate?: string[];
  };
  historicalSquareReference?: string;
  localSlug: string;
  lastSyncedAt: string;
  defaultPublishStatus: ProductPublishStatus;
};

export type ImportDecisionState =
  | 'mapped_existing'
  | 'new_candidate'
  | 'unpublished_missing_price'
  | 'unpublished_missing_variant_mapping'
  | 'ambiguous'
  | 'archived';

export type ImportDecision = {
  slug: string;
  name: string;
  state: ImportDecisionState;
  reasons: string[];
  matchedLocalSlugs: string[];
};

export function detectSlugCollisions(imported: ImportedPrintfulProduct[], localProducts: Product[]): string[] {
  const localSlugs = new Set(localProducts.map((product) => product.slug));
  return imported
    .filter((product) => localSlugs.has(product.localSlug) && !localProducts.some((local) => local.printfulProductId === String(product.printfulSyncProductId)))
    .map((product) => product.localSlug)
    .sort();
}

export function normalizeImportedProduct(snapshot: SnapshotProduct): ImportedPrintfulProduct {
  const variants = snapshot.variants.map((variant) => ({
    printfulSyncVariantId: variant.id,
    printfulVariantId: variant.catalogVariantId || variant.id,
    sku: variant.sku || undefined,
    size: variant.size,
    color: variant.color,
    active: variant.active,
    retailPrice: typeof variant.retailPrice === 'number' && variant.retailPrice > 0 ? variant.retailPrice : undefined,
  }));

  const hasMissingPrice = variants.some((variant) => typeof variant.retailPrice !== 'number');
  const isLegacyArchive = LEGACY_ARCHIVE_SYNC_PRODUCT_IDS.includes(snapshot.syncProductId as (typeof LEGACY_ARCHIVE_SYNC_PRODUCT_IDS)[number]);

  return {
    printfulSyncProductId: snapshot.syncProductId,
    externalProductId: snapshot.externalId,
    name: snapshot.name,
    description: snapshot.description,
    variants,
    mockups: {
      front: snapshot.mockupFrontUrl,
      back: snapshot.mockupBackUrl,
      alternate: snapshot.alternateMockupUrls,
    },
    historicalSquareReference: snapshot.externalId,
    localSlug: snapshot.slug,
    lastSyncedAt: snapshot.lastSyncedAt,
    defaultPublishStatus: isLegacyArchive ? 'archive' : hasMissingPrice ? 'draft' : 'draft',
  };
}

export function getImportedPrintfulProducts(): ImportedPrintfulProduct[] {
  return IMPORTED_PRINTFUL_PRODUCTS.map(normalizeImportedProduct);
}

function hasValidVariantMapping(product: ImportedPrintfulProduct, mappings: PrintfulProductMapping[]): boolean {
  const mapping = mappings.find((entry) => entry.syncProductId === product.printfulSyncProductId || entry.externalProductId === product.externalProductId);
  if (!mapping) return false;

  const remoteVariantIds = new Set(product.variants.map((variant) => variant.printfulSyncVariantId));
  const mappedIds = new Set(mapping.variants.map((variant) => variant.printfulVariantId));
  for (const id of remoteVariantIds) {
    if (!mappedIds.has(id)) return false;
  }
  return true;
}

function hasValidVariantData(product: ImportedPrintfulProduct): boolean {
  return product.variants.some((variant) => variant.active && Boolean(variant.size?.trim()) && Boolean(variant.color?.trim()));
}

function hasAnyActiveVariant(product: ImportedPrintfulProduct): boolean {
  return product.variants.some((variant) => variant.active);
}

function hasRetailPrice(product: ImportedPrintfulProduct): boolean {
  return product.variants.some((variant) => variant.active && typeof variant.retailPrice === 'number' && variant.retailPrice > 0);
}

function hasFrontMockup(product: ImportedPrintfulProduct): boolean {
  return Boolean(product.mockups.front);
}

export function classifyImportDecisions(
  imported: ImportedPrintfulProduct[],
  localProducts: Product[],
  mappings: PrintfulProductMapping[],
): ImportDecision[] {
  const decisions: ImportDecision[] = [];
  const localSkus = new Set(
    localProducts
      .flatMap((product) => product.variants)
      .map((variant) => variant.sku)
      .filter((sku): sku is string => Boolean(sku && sku.trim())),
  );

  const remoteSkuCounts = new Map<string, number>();
  for (const product of imported) {
    for (const variant of product.variants) {
      if (!variant.sku || !variant.active) continue;
      remoteSkuCounts.set(variant.sku, (remoteSkuCounts.get(variant.sku) || 0) + 1);
    }
  }

  const remoteSlugCounts = new Map<string, number>();
  for (const product of imported) {
    remoteSlugCounts.set(product.localSlug, (remoteSlugCounts.get(product.localSlug) || 0) + 1);
  }

  for (const product of imported) {
    const matchedBySync = mappings.filter(
      (entry) => entry.syncProductId === product.printfulSyncProductId || (product.externalProductId && entry.externalProductId === product.externalProductId),
    );
    const matchedBySku = localProducts.filter((local) => local.variants.some((variant) => product.variants.some((remote) => remote.sku && remote.sku === variant.sku)));
    const matchedSlugs = [...new Set([...matchedBySync.map((entry) => entry.slug), ...matchedBySku.map((entry) => entry.slug)])];

    const reasons: string[] = [];

    const localSlugCollision = localProducts.find(
      (local) => local.slug === product.localSlug && local.printfulProductId !== String(product.printfulSyncProductId),
    );
    if (localSlugCollision) {
      decisions.push({
        slug: product.localSlug,
        name: product.name,
        state: 'ambiguous',
        reasons: [...reasons, 'slug_collision'],
        matchedLocalSlugs: [localSlugCollision.slug],
      });
      continue;
    }

    if ((remoteSlugCounts.get(product.localSlug) || 0) > 1) {
      decisions.push({
        slug: product.localSlug,
        name: product.name,
        state: 'ambiguous',
        reasons: [...reasons, 'duplicate_remote_slug'],
        matchedLocalSlugs: matchedSlugs,
      });
      continue;
    }

    if (matchedBySync.length) reasons.push('matched_by_existing_mapping');
    if (matchedBySku.length) reasons.push('matched_by_sku');

    if (product.defaultPublishStatus === 'archive') {
      decisions.push({
        slug: product.localSlug,
        name: product.name,
        state: 'archived',
        reasons: [...reasons, 'legacy_archive_seed'],
        matchedLocalSlugs: matchedSlugs,
      });
      continue;
    }

    if (matchedSlugs.length > 1) {
      decisions.push({
        slug: product.localSlug,
        name: product.name,
        state: 'ambiguous',
        reasons: [...reasons, 'multiple_local_candidates'],
        matchedLocalSlugs: matchedSlugs.sort(),
      });
      continue;
    }

    const hasMapping = hasValidVariantMapping(product, mappings);
    if (matchedSlugs.length === 1 && hasMapping) {
      decisions.push({
        slug: product.localSlug,
        name: product.name,
        state: 'mapped_existing',
        reasons,
        matchedLocalSlugs: matchedSlugs,
      });
      continue;
    }

    if (matchedSlugs.length === 1 && !hasMapping) {
      decisions.push({
        slug: product.localSlug,
        name: product.name,
        state: 'unpublished_missing_variant_mapping',
        reasons: [...reasons, 'incomplete_variant_mapping'],
        matchedLocalSlugs: matchedSlugs,
      });
      continue;
    }

    const duplicateSku = product.variants.some((variant) => {
      if (!variant.sku || !variant.active) return false;
      return localSkus.has(variant.sku) || (remoteSkuCounts.get(variant.sku) || 0) > 1;
    });

    if (duplicateSku) {
      decisions.push({
        slug: product.localSlug,
        name: product.name,
        state: 'ambiguous',
        reasons: [...reasons, 'sku_conflict'],
        matchedLocalSlugs: matchedSlugs,
      });
      continue;
    }

    if (!hasAnyActiveVariant(product) || !hasValidVariantData(product)) {
      decisions.push({
        slug: product.localSlug,
        name: product.name,
        state: 'unpublished_missing_variant_mapping',
        reasons: [...reasons, 'missing_active_variant_data'],
        matchedLocalSlugs: matchedSlugs,
      });
      continue;
    }

    if (!hasRetailPrice(product)) {
      decisions.push({
        slug: product.localSlug,
        name: product.name,
        state: 'unpublished_missing_price',
        reasons: [...reasons, 'missing_active_variant_retail_price'],
        matchedLocalSlugs: matchedSlugs,
      });
      continue;
    }

    if (!hasFrontMockup(product)) {
      decisions.push({
        slug: product.localSlug,
        name: product.name,
        state: 'ambiguous',
        reasons: [...reasons, 'missing_front_mockup'],
        matchedLocalSlugs: matchedSlugs,
      });
      continue;
    }

    decisions.push({
      slug: product.localSlug,
      name: product.name,
      state: 'new_candidate',
      reasons: ['unmapped_ready_for_local_review'],
      matchedLocalSlugs: [],
    });
  }

  return decisions;
}
