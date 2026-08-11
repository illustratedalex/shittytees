export type FulfillmentReadiness = {
  ready: boolean;
  reasons: string[];
};

export function evaluateVariantFulfillmentReadiness(productId: string, variantId: string): FulfillmentReadiness {
  if (!productId) {
    return { ready: false, reasons: ['missing_product'] };
  }

  if (!variantId) {
    return { ready: false, reasons: ['missing_variant'] };
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
  if (!slug) {
    return { ready: false, reasons: ['missing_or_non_public_product'] };
  }

  return { ready: true, reasons: [] };
}
