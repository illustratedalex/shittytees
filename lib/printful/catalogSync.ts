import { getCatalogRepository } from '@/lib/catalog';
import type { CatalogRepository } from '@/lib/catalog/types';
import { getStoreProduct, getStoreProducts } from './products';
import type { PrintfulStoreProduct, PrintfulSyncProductDetail, PrintfulSyncVariant } from './types';
import type { Product, ProductVariant } from '@/lib/types/product';

export type CatalogSyncResult = {
  checked: number;
  created: number;
  updated: number;
  unchanged: number;
  failed: number;
  errors: string[];
};

export type PrintfulCatalogClient = {
  getStoreProducts(): Promise<PrintfulStoreProduct[]>;
  getStoreProduct(id: number): Promise<PrintfulSyncProductDetail>;
};

type SyncDependencies = {
  repository: CatalogRepository;
  client: PrintfulCatalogClient;
};

const DEFAULT_CATEGORY = 'T-Shirts';

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function generateUniqueSlug(repository: CatalogRepository, baseName: string, printfulId: number): Promise<string> {
  const base = slugify(baseName) || `printful-product-${printfulId}`;
  const existing = await repository.getBySlug(base);
  if (!existing) return base;
  return `${base}-${printfulId}`;
}

function pickImageUrls(detail: PrintfulSyncProductDetail): Product['images'] {
  const urls = new Set<string>();

  const addFileUrls = (file?: { url?: string; preview_url?: string; thumbnail_url?: string }) => {
    if (!file) return;
    if (file.preview_url) urls.add(file.preview_url);
    if (file.thumbnail_url) urls.add(file.thumbnail_url);
    if (file.url) urls.add(file.url);
  };

  for (const file of detail.sync_product.files || []) {
    addFileUrls(file);
  }

  for (const variant of detail.sync_variants || []) {
    if (variant.mockup_url) urls.add(variant.mockup_url);
    if (variant.product?.image) urls.add(variant.product.image);
    for (const file of variant.files || []) {
      addFileUrls(file);
    }
  }

  const imageList = [...urls];
  if (!imageList.length) {
    return [];
  }

  return imageList.map((src, index) => ({
    id: `${detail.sync_product.id}-img-${index + 1}`,
    src,
    alt: `${detail.sync_product.name} preview ${index + 1}`,
  }));
}

function extractRetailPrice(variant: PrintfulSyncVariant): number {
  const candidates = [variant.retail_price, variant.price];
  for (const value of candidates) {
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  return 0;
}

function variantAvailable(variant: PrintfulSyncVariant): boolean {
  if (variant.is_discontinued) return false;
  if (variant.is_ignored) return false;
  if (variant.availability_status && variant.availability_status !== 'active') return false;
  return variant.available !== false;
}

function toVariantName(productName: string, size: string, color: string): string {
  return `${productName} ${color} ${size}`.trim();
}

function buildOperationalVariants(detail: PrintfulSyncProductDetail, baseProductId: string, existing?: Product): ProductVariant[] {
  const existingByPrintful = new Map(
    (existing?.variants || [])
      .filter((variant) => variant.printfulSyncVariantId || variant.printfulVariantId)
      .map((variant) => [variant.printfulSyncVariantId || variant.printfulVariantId, variant]),
  );

  return (detail.sync_variants || []).map((variant, index) => {
    const syncVariantId = String(variant.id);
    const existingVariant = existingByPrintful.get(syncVariantId);

    const size = variant.size || 'One Size';
    const color = variant.color || 'Default';
    const catalogVariantId = typeof variant.variant_id === 'number' ? String(variant.variant_id) : existingVariant?.printfulCatalogVariantId;
    const externalVariantId = variant.external_id || existingVariant?.printfulVariantExternalId;

    return {
      id: existingVariant?.id || `${baseProductId}-var-${index + 1}`,
      // Keep the legacy field as sync_variant_id for checkout compatibility.
      printfulVariantId: syncVariantId,
      printfulSyncVariantId: syncVariantId,
      printfulCatalogVariantId: catalogVariantId,
      printfulVariantExternalId: externalVariantId,
      name: existingVariant?.name || toVariantName(detail.sync_product.name, size, color),
      size,
      color,
      colorHex: variant.color_code || existingVariant?.colorHex || '#000000',
      sku: variant.sku || existingVariant?.sku || `${baseProductId.toUpperCase()}-${index + 1}`,
      retailPrice: extractRetailPrice(variant) || existingVariant?.retailPrice || 0,
      available: variantAvailable(variant),
    };
  });
}

function mergeExistingWithOperational(existing: Product, detail: PrintfulSyncProductDetail): Product {
  const nextVariants = buildOperationalVariants(detail, existing.id, existing);
  const variantPrice = nextVariants.find((variant) => variant.retailPrice > 0)?.retailPrice;
  const nextImages = pickImageUrls(detail);

  return {
    ...existing,
    printfulProductId: String(detail.sync_product.id),
    printfulExternalId: detail.sync_product.external_id || existing.printfulExternalId,
    images: nextImages.length ? nextImages : existing.images,
    variants: nextVariants,
    retailPrice: variantPrice || existing.retailPrice,
    updatedAt: new Date(),
  };
}

function buildDraftFromPrintful(detail: PrintfulSyncProductDetail, slug: string): Product {
  const productId = `pf-${detail.sync_product.id}`;
  const variants = buildOperationalVariants(detail, productId);
  const retailPrice = variants.find((variant) => variant.retailPrice > 0)?.retailPrice || 0;

  return {
    id: productId,
    printfulProductId: String(detail.sync_product.id),
    printfulExternalId: detail.sync_product.external_id,
    slug,
    name: detail.sync_product.name,
    shortDescription: 'New from Printful. Review copy before publishing.',
    description: `Imported from Printful product ${detail.sync_product.name}. Update this description before publishing.`,
    category: DEFAULT_CATEGORY,
    collectionSlug: 'archive',
    active: true,
    publishStatus: 'draft',
    featured: false,
    images: pickImageUrls(detail),
    basePrice: retailPrice,
    retailPrice,
    currency: 'USD',
    variants,
    tags: ['new-from-printful'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function isOperationallyEqual(left: Product, right: Product): boolean {
  const variantSignature = (product: Product) =>
    product.variants
      .map((variant) => `${variant.printfulVariantId}:${variant.sku}:${variant.size}:${variant.color}:${variant.available}:${variant.retailPrice}`)
      .sort()
      .join('|');

  return (
    left.printfulProductId === right.printfulProductId &&
    left.images.map((image) => image.src).join('|') === right.images.map((image) => image.src).join('|') &&
    variantSignature(left) === variantSignature(right)
  );
}

export async function syncPrintfulCatalogWithDependencies(deps: SyncDependencies): Promise<CatalogSyncResult> {
  const result: CatalogSyncResult = {
    checked: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
    errors: [],
  };

  const runId = await deps.repository.startSyncRun();
  const seenPrintfulIds: number[] = [];

  console.log('[Printful Sync] started');

  try {
    const summaries = await deps.client.getStoreProducts();
    console.log(`[Printful Sync] retrieved ${summaries.length} products`);

    for (const summary of summaries) {
      result.checked += 1;
      seenPrintfulIds.push(summary.id);

      try {
        const detail = await deps.client.getStoreProduct(summary.id);
        let existing = await deps.repository.findByPrintfulProductId(summary.id);
        if (!existing && summary.external_id) {
          existing = await deps.repository.findByExternalId(summary.external_id);
        }

        if (!existing) {
          const slug = await generateUniqueSlug(deps.repository, detail.sync_product.name, summary.id);
          const created = buildDraftFromPrintful(detail, slug);
          await deps.repository.upsertProduct(created, {
            newFromPrintful: true,
            printfulStatus: summary.is_ignored ? 'ignored' : summary.synced === 0 ? 'unsynced' : 'active',
            printfulLastSyncedAt: new Date(),
          });
          result.created += 1;
          console.log(`[Printful Sync] created ${created.id}`);
          continue;
        }

        const updatedCandidate = mergeExistingWithOperational(existing, detail);
        const keepAsNewFromPrintful = existing.publishStatus === 'draft' && existing.tags.includes('new-from-printful');
        if (isOperationallyEqual(existing, updatedCandidate)) {
          await deps.repository.upsertProduct(existing, {
            newFromPrintful: keepAsNewFromPrintful,
            printfulStatus: summary.is_ignored ? 'ignored' : summary.synced === 0 ? 'unsynced' : 'active',
            printfulLastSyncedAt: new Date(),
          });
          result.unchanged += 1;
          continue;
        }

        await deps.repository.upsertProduct(updatedCandidate, {
          newFromPrintful: keepAsNewFromPrintful,
          printfulStatus: summary.is_ignored ? 'ignored' : summary.synced === 0 ? 'unsynced' : 'active',
          printfulLastSyncedAt: new Date(),
        });
        result.updated += 1;
        console.log(`[Printful Sync] updated ${updatedCandidate.id}`);
      } catch (error) {
        result.failed += 1;
        const reason = error instanceof Error ? error.message : String(error);
        result.errors.push(`product:${summary.id}:${reason}`);
      }
    }

    if (result.failed === 0) {
      await deps.repository.setPrintfulMissingForUnseenProducts(seenPrintfulIds);
    }

    await deps.repository.completeSyncRun(runId, {
      completedAt: new Date(),
      status: result.failed > 0 ? 'failed' : 'completed',
      ...result,
    });
    console.log('[Printful Sync] completed');

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result.failed += 1;
    result.errors.push(message);

    await deps.repository.completeSyncRun(runId, {
      completedAt: new Date(),
      status: 'failed',
      ...result,
    });

    throw error;
  }
}

export async function syncPrintfulCatalog(): Promise<CatalogSyncResult> {
  const repository = getCatalogRepository();
  return syncPrintfulCatalogWithDependencies({
    repository,
    client: {
      getStoreProducts,
      getStoreProduct,
    },
  });
}
