import { findPrintfulVariantMapping } from '@/data/printfulMappings';
import { CheckoutLineItem } from '@/lib/validation/schemas';

export type ResolvedVariant = {
  productId: string;
  variantId: string;
  printfulVariantId: number;
  syncProductId: number;
  sku: string;
  quantity: number;
  retailPrice: number;
};

export function resolveVariant(lineItem: CheckoutLineItem): ResolvedVariant {
  const mapping = findPrintfulVariantMapping(lineItem.productId, lineItem.variantId);

  if (!mapping) {
    throw new Error(`Unknown product or variant mapping for ${lineItem.productId}/${lineItem.variantId}`);
  }

  if (lineItem.printfulVariantId !== `${mapping.printfulVariantId}`) {
    throw new Error(`Printful variant tamper detected for ${lineItem.productId}/${lineItem.variantId}`);
  }

  if (lineItem.unitPrice !== mapping.retailPrice) {
    throw new Error(`Price mismatch for ${lineItem.productId}/${lineItem.variantId}`);
  }

  return {
    productId: lineItem.productId,
    variantId: lineItem.variantId,
    printfulVariantId: mapping.printfulVariantId,
    syncProductId: mapping.syncProductId,
    sku: mapping.sku,
    quantity: lineItem.quantity,
    retailPrice: mapping.retailPrice,
  };
}
