import { copyFile, mkdir, readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { ensureScriptEnvLoaded } from './load-env';

type ImportedPrintfulVariant = {
  id: number;
  externalId?: string;
  catalogVariantId?: number;
  size: string;
  color: string;
  sku: string;
  retailPrice: number;
  active: boolean;
  mockupFrontUrl?: string;
  mockupBackUrl?: string;
  alternateMockupUrls: string[];
  files: Array<{ type?: string; url?: string; visible?: boolean }>;
};

type ImportedPrintfulProduct = {
  syncProductId: number;
  externalId?: string;
  name: string;
  slug: string;
  description: string;
  collectionSlug: 'archive';
  variants: ImportedPrintfulVariant[];
  mockupFrontUrl?: string;
  mockupBackUrl?: string;
  alternateMockupUrls: string[];
  artworkFiles: Array<{ type?: string; url?: string; visible?: boolean }>;
  lastSyncedAt: string;
};

type PrintfulApiFile = {
  type?: string | null;
  url?: string | null;
  preview_url?: string | null;
  thumbnail_url?: string | null;
  filename?: string | null;
  visible?: boolean | null;
};

type DecisionState =
  | 'mapped_existing'
  | 'new_candidate'
  | 'unpublished_missing_price'
  | 'unpublished_missing_variant_mapping'
  | 'ambiguous'
  | 'archived';

type NewCandidateReadiness = 'ready' | 'missing-price' | 'missing-mockup' | 'missing-variant' | 'ambiguous';

type NewCandidate = {
  printfulSyncProductId: number;
  externalProductId?: string;
  proposedSlug: string;
  title: string;
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
  importedAt: string;
  readiness: NewCandidateReadiness;
};

type CandidateProductMapping = {
  productId: string;
  slug: string;
  name: string;
  printfulProductId: number;
  syncProductId: number;
  externalProductId?: string;
  primaryImage?: string;
  backImage?: string;
  alternateImages?: string[];
  lastSyncedAt?: string;
  variants: Array<{
    productId: string;
    variantId: string;
    printfulVariantId: number;
    syncProductId: number;
    sku: string;
    size: string;
    color: string;
    retailPrice: number;
  }>;
};

type CandidatePresentation = {
  slug: string;
  frontImage?: string;
  backImage?: string;
  detailImages?: string[];
  garmentColor?: string;
  artworkDisplayText?: string;
  artworkPlacement?: string;
  source?: string;
  lastSyncedAt?: string;
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90);
}

function esc(input: string): string {
  return input.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function parseArgs() {
  return {
    apply: process.argv.includes('--apply'),
  };
}

function normalizeForSignature(product: ImportedPrintfulProduct) {
  return {
    syncProductId: product.syncProductId,
    externalId: product.externalId,
    name: product.name,
    slug: product.slug,
    description: product.description,
    collectionSlug: product.collectionSlug,
    mockupFrontUrl: product.mockupFrontUrl,
    mockupBackUrl: product.mockupBackUrl,
    alternateMockupUrls: product.alternateMockupUrls,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      externalId: variant.externalId,
      catalogVariantId: variant.catalogVariantId,
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      retailPrice: variant.retailPrice,
      active: variant.active,
      mockupFrontUrl: variant.mockupFrontUrl,
      mockupBackUrl: variant.mockupBackUrl,
      alternateMockupUrls: variant.alternateMockupUrls,
      files: variant.files,
    })),
  };
}

function signature(product: ImportedPrintfulProduct): string {
  return JSON.stringify(normalizeForSignature(product));
}

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function sortFiles(files: Array<{ type?: string; url?: string; visible?: boolean }>): Array<{ type?: string; url?: string; visible?: boolean }> {
  return [...files].sort((a, b) => {
    const aKey = `${a.type || ''}|${a.url || ''}|${String(a.visible)}`;
    const bKey = `${b.type || ''}|${b.url || ''}|${String(b.visible)}`;
    return aKey.localeCompare(bKey);
  });
}

function normalizeFile(file: { type?: string | null; url?: string | null; visible?: boolean | null }): { type?: string; url?: string; visible?: boolean } {
  const bestUrl = file.url ?? undefined;
  return {
    type: file.type ?? undefined,
    url: bestUrl,
    visible: typeof file.visible === 'boolean' ? file.visible : undefined,
  };
}

function bestFileUrl(file: PrintfulApiFile): string | undefined {
  return file.preview_url ?? file.url ?? file.thumbnail_url ?? undefined;
}

function fileSearchText(file: PrintfulApiFile): string {
  return [file.type, file.filename, file.url, file.preview_url, file.thumbnail_url]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();
}

function uniqueFileUrls(files: PrintfulApiFile[]): string[] {
  return sortStrings([...new Set(files.map((file) => bestFileUrl(file)).filter((value): value is string => Boolean(value)))]);
}

function pickFileUrl(files: PrintfulApiFile[], matcher: RegExp): string | undefined {
  const matched = files.find((file) => matcher.test(fileSearchText(file)) && bestFileUrl(file));
  return matched ? bestFileUrl(matched) : undefined;
}

function toCandidateReadiness(decisionState: DecisionState, reasons: string[]): NewCandidateReadiness {
  if (decisionState === 'new_candidate') return 'ready';
  if (decisionState === 'unpublished_missing_price') return 'missing-price';
  if (decisionState === 'unpublished_missing_variant_mapping') return 'missing-variant';
  if (reasons.includes('missing_front_mockup')) return 'missing-mockup';
  return 'ambiguous';
}

function stableJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function safeFileName(path: string): string {
  return path.replace(/[\/]/g, '__');
}

async function readOrEmpty(filePath: string): Promise<string> {
  try {
    return await readFile(filePath, 'utf8');
  } catch {
    return '';
  }
}

async function applyPlannedWrites(changes: Array<{ relativePath: string; absolutePath: string; nextContent: string }>): Promise<string[]> {
  const changed = [];
  for (const item of changes) {
    const current = await readOrEmpty(item.absolutePath);
    if (current !== item.nextContent) {
      changed.push(item);
    }
  }

  if (!changed.length) {
    return [];
  }

  const backupRoot = resolve(process.cwd(), '.generated/backups');
  await mkdir(backupRoot, { recursive: true });

  const backups: string[] = [];
  const timestamp = Date.now();
  for (const item of changed) {
    const backupPath = resolve(backupRoot, `${safeFileName(item.relativePath)}.${timestamp}.bak`);
    const hasExisting = (await readOrEmpty(item.absolutePath)) !== '';
    if (hasExisting) {
      await copyFile(item.absolutePath, backupPath);
      backups.push(backupPath);
    }
    await writeFile(item.absolutePath, item.nextContent, 'utf8');
  }

  return backups;
}

function stringifyImportedCatalog(products: ImportedPrintfulProduct[]): string {
  const lines: string[] = [];

  lines.push("export type ImportedPrintfulVariant = {");
  lines.push('  id: number;');
  lines.push('  externalId?: string;');
  lines.push('  catalogVariantId?: number;');
  lines.push('  size: string;');
  lines.push('  color: string;');
  lines.push('  sku: string;');
  lines.push('  retailPrice: number;');
  lines.push('  active: boolean;');
  lines.push('  mockupFrontUrl?: string;');
  lines.push('  mockupBackUrl?: string;');
  lines.push('  alternateMockupUrls: string[];');
  lines.push('  files: Array<{ type?: string; url?: string; visible?: boolean }>;');
  lines.push('};');
  lines.push('');
  lines.push('export type ImportedPrintfulProduct = {');
  lines.push('  syncProductId: number;');
  lines.push('  externalId?: string;');
  lines.push('  name: string;');
  lines.push('  slug: string;');
  lines.push('  description: string;');
  lines.push("  collectionSlug: 'archive';");
  lines.push('  variants: ImportedPrintfulVariant[];');
  lines.push('  mockupFrontUrl?: string;');
  lines.push('  mockupBackUrl?: string;');
  lines.push('  alternateMockupUrls: string[];');
  lines.push('  artworkFiles: Array<{ type?: string; url?: string; visible?: boolean }>;');
  lines.push('  lastSyncedAt: string;');
  lines.push('};');
  lines.push('');
  lines.push('export const IMPORTED_PRINTFUL_PRODUCTS: ImportedPrintfulProduct[] = [');

  for (const product of products) {
    lines.push('  {');
    lines.push(`    syncProductId: ${product.syncProductId},`);
    if (product.externalId) lines.push(`    externalId: '${esc(product.externalId)}',`);
    lines.push(`    name: '${esc(product.name)}',`);
    lines.push(`    slug: '${esc(product.slug)}',`);
    lines.push(`    description: '${esc(product.description)}',`);
    lines.push("    collectionSlug: 'archive',");
    if (product.mockupFrontUrl) lines.push(`    mockupFrontUrl: '${esc(product.mockupFrontUrl)}',`);
    if (product.mockupBackUrl) lines.push(`    mockupBackUrl: '${esc(product.mockupBackUrl)}',`);
    lines.push(`    alternateMockupUrls: [${product.alternateMockupUrls.map((value) => `'${esc(value)}'`).join(', ')}],`);
    lines.push('    artworkFiles: [');
    for (const file of product.artworkFiles) {
      lines.push(`      { type: ${file.type ? `'${esc(file.type)}'` : 'undefined'}, url: ${file.url ? `'${esc(file.url)}'` : 'undefined'}, visible: ${typeof file.visible === 'boolean' ? file.visible : 'undefined'} },`);
    }
    lines.push('    ],');
    lines.push(`    lastSyncedAt: '${product.lastSyncedAt}',`);
    lines.push('    variants: [');
    for (const variant of product.variants) {
      lines.push('      {');
      lines.push(`        id: ${variant.id},`);
      if (variant.externalId) lines.push(`        externalId: '${esc(variant.externalId)}',`);
      if (variant.catalogVariantId) lines.push(`        catalogVariantId: ${variant.catalogVariantId},`);
      lines.push(`        size: '${esc(variant.size)}',`);
      lines.push(`        color: '${esc(variant.color)}',`);
      lines.push(`        sku: '${esc(variant.sku)}',`);
      lines.push(`        retailPrice: ${variant.retailPrice},`);
      lines.push(`        active: ${variant.active},`);
      if (variant.mockupFrontUrl) lines.push(`        mockupFrontUrl: '${esc(variant.mockupFrontUrl)}',`);
      if (variant.mockupBackUrl) lines.push(`        mockupBackUrl: '${esc(variant.mockupBackUrl)}',`);
      lines.push(`        alternateMockupUrls: [${variant.alternateMockupUrls.map((value) => `'${esc(value)}'`).join(', ')}],`);
      lines.push('        files: [');
      for (const file of variant.files) {
        lines.push(`          { type: ${file.type ? `'${esc(file.type)}'` : 'undefined'}, url: ${file.url ? `'${esc(file.url)}'` : 'undefined'}, visible: ${typeof file.visible === 'boolean' ? file.visible : 'undefined'} },`);
      }
      lines.push('        ],');
      lines.push('      },');
    }
    lines.push('    ],');
    lines.push('  },');
  }

  lines.push('];');
  lines.push('');
  lines.push('export const IMPORTED_PRINTFUL_STORE_ID = 7561356;');
  lines.push('export const IMPORTED_PRINTFUL_IMAGE_HOSTS: string[] = [];');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

async function readSyncDetails(existing: ImportedPrintfulProduct[]): Promise<ImportedPrintfulProduct[]> {
  const { getSyncProducts, getSyncProduct } = await import('@/lib/printful/products');
  const products = (await getSyncProducts()).sort((a, b) => a.id - b.id);
  const now = new Date().toISOString();
  const existingBySyncId = new Map(existing.map((item) => [item.syncProductId, item]));

  const imported: ImportedPrintfulProduct[] = [];
  for (const product of products) {
    const detail = await getSyncProduct(product.id);
    const syncProduct = detail.sync_product;
    const syncVariants = [...(detail.sync_variants || [])].sort((a, b) => a.id - b.id);

    const syncProductFiles = (syncProduct.files || []) as PrintfulApiFile[];
    const syncVariantFiles = syncVariants.flatMap((variant) => (variant.files || []) as PrintfulApiFile[]);
    const allFiles = [...syncProductFiles, ...syncVariantFiles];

    const front = pickFileUrl(allFiles, /(front|front_large|front-small)/i);
    const back = pickFileUrl(allFiles, /(back|back_large|back-small)/i);
    const uniqueUrls = uniqueFileUrls(allFiles);
    const alternate = uniqueUrls.filter((value) => value !== front && value !== back);

    const nextProduct: ImportedPrintfulProduct = {
      syncProductId: syncProduct.id,
      externalId: syncProduct.external_id,
      name: syncProduct.name,
      slug: slugify(syncProduct.name),
      description: `Archive import from legacy Printful store product: ${syncProduct.name}.`,
      collectionSlug: 'archive',
      mockupFrontUrl: front,
      mockupBackUrl: back,
      alternateMockupUrls: alternate,
      artworkFiles: sortFiles(syncProductFiles.map((file) => normalizeFile({
        type: file.type,
        url: bestFileUrl(file),
        visible: file.visible,
      }))),
      lastSyncedAt: now,
      variants: syncVariants.map((variant) => {
        const files = (variant.files || []) as PrintfulApiFile[];
        const variantUrls = uniqueFileUrls(files);
        const variantFront = pickFileUrl(files, /(front|front_large|front-small)/i);
        const variantBack = pickFileUrl(files, /(back|back_large|back-small)/i);
        return {
          id: variant.id,
          externalId: variant.external_id,
          catalogVariantId: variant.variant_id,
          size: variant.size || '',
          color: variant.color || '',
          sku: variant.sku || '',
          retailPrice: Number(variant.retail_price || 0),
          active: !variant.is_ignored && !variant.is_discontinued,
          mockupFrontUrl: variantFront,
          mockupBackUrl: variantBack,
          alternateMockupUrls: sortStrings(variantUrls.filter((value) => value !== variantFront && value !== variantBack)),
          files: sortFiles(files.map((file) => normalizeFile({
            type: file.type,
            url: bestFileUrl(file),
            visible: file.visible,
          }))),
        };
      }),
    };

    const previous = existingBySyncId.get(nextProduct.syncProductId);
    if (previous && signature(previous) === signature(nextProduct)) {
      nextProduct.lastSyncedAt = previous.lastSyncedAt;
    }

    imported.push(nextProduct);
  }

  return imported;
}

async function main() {
  ensureScriptEnvLoaded();

  const args = parseArgs();
  const { getPrintfulEnv } = await import('@/lib/printful/env');
  const { getAllProducts } = await import('@/lib/data/products');
  const { IMPORTED_PRINTFUL_PRODUCTS } = await import('@/data/printfulImportedCatalog');
  const { NEW_CANDIDATES } = await import('@/data/newCandidates');
  const { PRINTFUL_PRODUCT_MAPPINGS } = await import('@/data/printfulMappings');
  const { detectDuplicateVariantMappings } = await import('@/lib/printful/localImport');
  const { classifyImportDecisions } = await import('@/lib/printful/catalog-import');

  const env = getPrintfulEnv();
  if (!env.apiToken || !env.storeId) {
    throw new Error('PRINTFUL_API_TOKEN and PRINTFUL_STORE_ID are required for printful:sync');
  }

  const existingImported = IMPORTED_PRINTFUL_PRODUCTS as ImportedPrintfulProduct[];

  const imported = await readSyncDetails(existingImported);
  const normalizedImported = imported.map((item) => ({
    printfulSyncProductId: item.syncProductId,
    externalProductId: item.externalId,
    name: item.name,
    description: item.description,
    variants: item.variants.map((variant) => ({
      printfulSyncVariantId: variant.id,
      printfulVariantId: variant.catalogVariantId || variant.id,
      sku: variant.sku || undefined,
      size: variant.size,
      color: variant.color,
      active: variant.active,
      retailPrice: variant.retailPrice > 0 ? variant.retailPrice : undefined,
    })),
    mockups: {
      front: item.mockupFrontUrl,
      back: item.mockupBackUrl,
      alternate: item.alternateMockupUrls,
    },
    historicalSquareReference: item.externalId,
    localSlug: item.slug,
    lastSyncedAt: item.lastSyncedAt,
    defaultPublishStatus: 'draft' as const,
  }));

  const localProducts = getAllProducts();
  const decisions = classifyImportDecisions(normalizedImported as any, localProducts, PRINTFUL_PRODUCT_MAPPINGS);
  const decisionBySlug = new Map(decisions.map((decision) => [decision.slug, decision]));
  const stateCounts = decisions.reduce<Record<DecisionState, number>>(
    (acc, decision) => {
      acc[decision.state] += 1;
      return acc;
    },
    {
      mapped_existing: 0,
      new_candidate: 0,
      unpublished_missing_price: 0,
      unpublished_missing_variant_mapping: 0,
      ambiguous: 0,
      archived: 0,
    },
  );

  const duplicates = detectDuplicateVariantMappings(PRINTFUL_PRODUCT_MAPPINGS);
  const mockups = imported.reduce(
    (acc, product) => {
      const hasAny = Boolean(product.mockupFrontUrl || product.mockupBackUrl || product.alternateMockupUrls.length);
      if (hasAny) acc.productsWithMockups += 1;
      else acc.productsWithoutMockups += 1;
      return acc;
    },
    { productsWithMockups: 0, productsWithoutMockups: 0 },
  );

  const existingCandidatesBySyncId = new Map(NEW_CANDIDATES.map((candidate) => [candidate.printfulSyncProductId, candidate]));

  const candidateProducts = normalizedImported
    .map((product) => {
      const decision = decisionBySlug.get(product.localSlug);
      if (!decision) return undefined;
      if (decision.state === 'mapped_existing' || decision.state === 'archived') return undefined;

      const existing = existingCandidatesBySyncId.get(product.printfulSyncProductId);
      return {
        printfulSyncProductId: product.printfulSyncProductId,
        externalProductId: product.externalProductId,
        proposedSlug: product.localSlug,
        title: product.name,
        variants: product.variants,
        mockups: product.mockups,
        importedAt: existing?.importedAt || product.lastSyncedAt,
        readiness: toCandidateReadiness(decision.state as DecisionState, decision.reasons),
      } as NewCandidate;
    })
    .filter((value): value is NewCandidate => Boolean(value))
    .sort((a, b) => a.proposedSlug.localeCompare(b.proposedSlug));

  const candidateMappings: CandidateProductMapping[] = candidateProducts
    .filter((candidate) => candidate.readiness !== 'ambiguous')
    .map((candidate) => {
      const productId = `imported-${candidate.printfulSyncProductId}`;
      return {
        productId,
        slug: candidate.proposedSlug,
        name: candidate.title,
        printfulProductId: candidate.printfulSyncProductId,
        syncProductId: candidate.printfulSyncProductId,
        externalProductId: candidate.externalProductId,
        primaryImage: candidate.mockups.front || candidate.mockups.back || candidate.mockups.alternate?.[0],
        backImage: candidate.mockups.back,
        alternateImages: candidate.mockups.alternate,
        lastSyncedAt: candidate.importedAt,
        variants: candidate.variants
          .filter((variant) => variant.active)
          .map((variant) => ({
            productId,
            variantId: `${productId}-var-${variant.printfulSyncVariantId}`,
            printfulVariantId: variant.printfulSyncVariantId,
            syncProductId: candidate.printfulSyncProductId,
            sku: variant.sku || `${candidate.proposedSlug}-${variant.size}-${variant.color}`,
            size: variant.size,
            color: variant.color,
            retailPrice: variant.retailPrice || 0,
          })),
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const candidatePresentations: CandidatePresentation[] = candidateProducts
    .map((candidate) => {
      const front = candidate.mockups.front || candidate.mockups.back || candidate.mockups.alternate?.[0];
      const back = candidate.mockups.back || candidate.mockups.alternate?.[1];
      const detailImages = [front, back, ...(candidate.mockups.alternate || [])].filter((value): value is string => Boolean(value));

      return {
        slug: candidate.proposedSlug,
        frontImage: front,
        backImage: back,
        detailImages,
        garmentColor: 'charcoal',
        artworkDisplayText: candidate.title,
        artworkPlacement: 'center',
        source: front || back || detailImages.length ? 'printful' : 'fallback',
        lastSyncedAt: candidate.importedAt,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const writeTargets = [
    {
      relativePath: 'data/printfulImportedCatalog.ts',
      absolutePath: resolve(process.cwd(), 'data/printfulImportedCatalog.ts'),
      nextContent: stringifyImportedCatalog(imported),
    },
    {
      relativePath: 'data/newCandidates.json',
      absolutePath: resolve(process.cwd(), 'data/newCandidates.json'),
      nextContent: stableJson(candidateProducts),
    },
    {
      relativePath: 'data/newCandidatePrintfulMappings.json',
      absolutePath: resolve(process.cwd(), 'data/newCandidatePrintfulMappings.json'),
      nextContent: stableJson(candidateMappings),
    },
    {
      relativePath: 'data/generatedProductPresentations.json',
      absolutePath: resolve(process.cwd(), 'data/generatedProductPresentations.json'),
      nextContent: stableJson(candidatePresentations),
    },
  ];

  const changedTargets = [];
  for (const target of writeTargets) {
    const currentContent = await readOrEmpty(target.absolutePath);
    if (currentContent !== target.nextContent) {
      changedTargets.push(target.relativePath);
    }
  }

  const hasChanges = changedTargets.length > 0;

  const report = {
    dryRun: !args.apply,
    summary: {
      remoteProducts: imported.length,
      remoteVariants: imported.reduce((count, product) => count + product.variants.length, 0),
      localProducts: localProducts.length,
      tokenConfigured: Boolean(env.apiToken),
      storeIdConfigured: Boolean(env.storeId),
      storeId: env.storeId,
      mappedProducts: stateCounts.mapped_existing,
      newCandidates: stateCounts.new_candidate,
      archiveProducts: stateCounts.archived,
      drafts: stateCounts.new_candidate + stateCounts.unpublished_missing_price + stateCounts.unpublished_missing_variant_mapping + stateCounts.ambiguous,
      missingPrices: stateCounts.unpublished_missing_price,
      missingVariants: stateCounts.unpublished_missing_variant_mapping,
      ambiguous: stateCounts.ambiguous,
      mockupAvailability: mockups,
      duplicateMappingCount: duplicates.length,
      reviewableCandidates: candidateProducts.length,
    },
    decisions,
    diagnostics: {
      duplicateMappings: duplicates,
    },
    files: {
      target: 'data/printfulImportedCatalog.ts',
      changed: hasChanges,
      wouldChangeOnApply: hasChanges,
      wouldWrite: changedTargets,
    },
  };

  if (!args.apply) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  if (!hasChanges) {
    console.log(JSON.stringify({ ...report, applied: false, reason: 'No changes detected' }, null, 2));
    return;
  }

  const backupPaths = await applyPlannedWrites(writeTargets);

  console.log(JSON.stringify({ ...report, applied: true, backupPaths }, null, 2));
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(`printful:sync failed: ${message}`);
  process.exitCode = 1;
});
