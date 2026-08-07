import { DEMO_PRODUCTS } from '@/lib/data/products';
import { IMPORTED_PRINTFUL_PRODUCTS } from './printfulImportedCatalog';
import { PUBLISHED_PRINTFUL_PRODUCT_MAPPINGS } from './publishedPrintfulMappings';

export type PrintfulVariantMapping = {
  productId: string;
  variantId: string;
  printfulVariantId: number;
  syncProductId: number;
  sku: string;
  size: string;
  color: string;
  retailPrice: number;
};

export type PrintfulProductMapping = {
  productId: string;
  slug: string;
  name: string;
  printfulProductId?: number;
  syncProductId?: number;
  externalProductId?: string;
  primaryImage?: string;
  backImage?: string;
  alternateImages?: string[];
  lastSyncedAt?: string;
  variants: PrintfulVariantMapping[];
};

const productMappingSeeds: PrintfulProductMapping[] = DEMO_PRODUCTS.filter((product) => product.id.startsWith('prod-')).map((product, productIndex) => ({
  productId: product.id,
  slug: product.slug,
  name: product.name,
  printfulProductId: 100000 + productIndex,
  syncProductId: 200000 + productIndex,
  primaryImage: product.images[0]?.src,
  variants: product.variants.map((variant, variantIndex) => ({
    productId: product.id,
    variantId: variant.id,
    printfulVariantId: 300000 + productIndex * 10 + variantIndex,
    syncProductId: 200000 + productIndex,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    retailPrice: variant.retailPrice,
  })),
}));

const archiveProductMap = new Map(
  IMPORTED_PRINTFUL_PRODUCTS.map((imported) => [imported.slug, imported]),
);

const mergedMappings: PrintfulProductMapping[] = productMappingSeeds.map((seed) => {
  const imported = archiveProductMap.get(seed.slug);
  if (!imported) {
    return seed;
  }

  return {
    ...seed,
    printfulProductId: imported.syncProductId,
    syncProductId: imported.syncProductId,
    externalProductId: imported.externalId,
    primaryImage: imported.mockupFrontUrl || imported.mockupBackUrl || imported.alternateMockupUrls[0] || seed.primaryImage,
    backImage: imported.mockupBackUrl,
    alternateImages: imported.alternateMockupUrls,
    lastSyncedAt: imported.lastSyncedAt,
    variants: imported.variants.map((variant) => {
      const localVariant = seed.variants.find((item) => item.sku === variant.sku || item.size === variant.size && item.color === variant.color);
      return {
        productId: seed.productId,
        variantId: localVariant?.variantId || `${seed.productId}-var-${variant.id}`,
        printfulVariantId: variant.id,
        syncProductId: imported.syncProductId,
        sku: variant.sku,
        size: variant.size,
        color: variant.color,
        retailPrice: variant.retailPrice,
      };
    }),
  };
});

const mergedAllMappings = [
  ...mergedMappings,
  ...PUBLISHED_PRINTFUL_PRODUCT_MAPPINGS,
];

const dedupedMappings = new Map<string, PrintfulProductMapping>();
for (const mapping of mergedAllMappings) {
  dedupedMappings.set(mapping.slug, mapping);
}

export const PRINTFUL_PRODUCT_MAPPINGS = [...dedupedMappings.values()];

export function findPrintfulProductMappingByProductId(productId: string): PrintfulProductMapping | undefined {
  return PRINTFUL_PRODUCT_MAPPINGS.find((mapping) => mapping.productId === productId);
}

export function findPrintfulVariantMapping(productId: string, variantId: string): PrintfulVariantMapping | undefined {
  const productMapping = findPrintfulProductMappingByProductId(productId);
  return productMapping?.variants.find((variant) => variant.variantId === variantId);
}

export function listPrintfulVariantMappings(): PrintfulVariantMapping[] {
  return PRINTFUL_PRODUCT_MAPPINGS.flatMap((mapping) => mapping.variants);
}
