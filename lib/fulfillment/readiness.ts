import { getProductBySlug, DEMO_PRODUCTS } from '@/lib/data/products';
import { findPrintfulProductMappingByProductId } from '@/data/printfulMappings';

export type FulfillmentReadiness = {
  ready: boolean;
  reasons: string[];
};

export function evaluateVariantFulfillmentReadiness(productId: string, variantId: string): FulfillmentReadiness {
  const product = DEMO_PRODUCTS.find((item) => item.id === productId);
  if (!product) {
    return { ready: false, reasons: ['missing_product'] };
  }

  const variant = product.variants.find((item) => item.id === variantId);
  if (!variant) {
    return { ready: false, reasons: ['missing_variant'] };
  }

  if (!variant.available) {
    return { ready: false, reasons: ['inactive_variant'] };
  }

  const mapping = findPrintfulProductMappingByProductId(productId);
  if (!mapping) {
    return { ready: false, reasons: ['missing_product_mapping'] };
  }

  const variantMapping = mapping.variants.find((item) => item.variantId === variantId);
  if (!variantMapping) {
    return { ready: false, reasons: ['missing_variant_mapping'] };
  }

  if (!variantMapping.printfulVariantId) {
    return { ready: false, reasons: ['missing_printful_variant_id'] };
  }

  if (variant.retailPrice !== variantMapping.retailPrice) {
    return { ready: false, reasons: ['price_mismatch'] };
  }

  return { ready: true, reasons: [] };
}

export function evaluateCartFulfillmentReadiness(items: Array<{ productId: string; variantId: string }>): FulfillmentReadiness {
  const reasons: string[] = [];
  for (const item of items) {
    const check = evaluateVariantFulfillmentReadiness(item.productId, item.variantId);
    if (!check.ready) {
      reasons.push(`${item.productId}:${item.variantId}:${check.reasons.join(',')}`);
    }
  }

  return {
    ready: reasons.length === 0,
    reasons,
  };
}

export function isSlugFulfillmentReady(slug: string): FulfillmentReadiness {
  const product = getProductBySlug(slug);
  if (!product) {
    return { ready: false, reasons: ['missing_or_non_public_product'] };
  }

  const reasons = product.variants
    .map((variant) => evaluateVariantFulfillmentReadiness(product.id, variant.id))
    .filter((item) => !item.ready)
    .flatMap((item) => item.reasons);

  return {
    ready: reasons.length === 0,
    reasons,
  };
}
