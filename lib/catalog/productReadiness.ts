import { getProductPresentation } from '@/data/productPresentation';
import { getProductStatusOverride, ProductPublishStatus } from '@/data/productStatus';
import { findPrintfulProductMappingByProductId } from '@/data/printfulMappings';
import { Product } from '@/lib/types/product';

export type ProductReadiness = {
  slug: string;
  title: string;
  publishStatus: ProductPublishStatus;
  collection: string;
  price: number;
  variantCount: number;
  mappingReady: boolean;
  mockupReady: boolean;
  fulfillmentReady: boolean;
  missingRequirements: string[];
};

export function getEffectivePublishStatus(product: Product): ProductPublishStatus {
  return getProductStatusOverride(product.slug) || product.publishStatus;
}

export function isPublicPublishStatus(status: ProductPublishStatus): boolean {
  return status === 'published' || status === 'archive';
}

export function evaluateProductReadiness(product: Product): ProductReadiness {
  const status = getEffectivePublishStatus(product);
  const presentation = getProductPresentation(product.slug);
  const mapping = findPrintfulProductMappingByProductId(product.id);

  const missingRequirements: string[] = [];
  if (!product.retailPrice || product.retailPrice <= 0) missingRequirements.push('missing_price');
  if (!product.variants.length) missingRequirements.push('missing_variants');
  if (!mapping) missingRequirements.push('missing_product_mapping');

  if (mapping) {
    for (const variant of product.variants) {
      const variantMapping = mapping.variants.find((entry) => entry.variantId === variant.id);
      if (!variantMapping) {
        missingRequirements.push(`missing_variant_mapping:${variant.id}`);
      }
      if (!variant.available) {
        missingRequirements.push(`inactive_variant:${variant.id}`);
      }
    }
  }

  const mockupReady = Boolean(presentation?.frontImage || product.images[0]?.src || presentation?.artworkDisplayText);
  if (!mockupReady) missingRequirements.push('missing_mockup_or_fallback');

  const mappingReady = !missingRequirements.some((value) => value.startsWith('missing_product_mapping') || value.startsWith('missing_variant_mapping'));
  const fulfillmentReady = mappingReady && !missingRequirements.some((value) => value.startsWith('inactive_variant'));

  return {
    slug: product.slug,
    title: product.name,
    publishStatus: status,
    collection: product.collectionSlug,
    price: product.retailPrice,
    variantCount: product.variants.length,
    mappingReady,
    mockupReady,
    fulfillmentReady,
    missingRequirements,
  };
}
