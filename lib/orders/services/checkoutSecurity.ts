import { DEMO_PRODUCTS } from '@/lib/data/products';
import { resolveVariant } from '@/lib/fulfillment/resolveVariant';
import { CheckoutLineItem } from '@/lib/validation/schemas';
import { UnresolvedVariantError } from '@/lib/orders/errors';
import { StoreOrderItem } from '@/lib/orders/types';

type ValidatedLineItem = CheckoutLineItem & {
  productSlug: string;
  canonicalUnitPrice: number;
};

function keyOf(item: CheckoutLineItem): string {
  return `${item.productId}:${item.variantId}`;
}

export function validateAndNormalizeCheckoutItems(items: CheckoutLineItem[]): ValidatedLineItem[] {
  const aggregated = new Map<string, CheckoutLineItem>();

  for (const item of items) {
    if (item.quantity <= 0 || item.quantity > 100) {
      throw new Error(`Invalid quantity for ${item.productId}/${item.variantId}`);
    }

    const product = DEMO_PRODUCTS.find((candidate) => candidate.id === item.productId);
    if (!product) {
      throw new Error(`Unknown product: ${item.productId}`);
    }

    const variant = product.variants.find((candidate) => candidate.id === item.variantId);
    if (!variant || !variant.available) {
      throw new Error(`Unknown or unavailable variant: ${item.variantId}`);
    }

    if (item.size !== variant.size || item.color !== variant.color) {
      throw new Error(`Variant attribute mismatch for ${item.productId}/${item.variantId}`);
    }

    const resolved = resolveVariant(item);
    if (!resolved.printfulVariantId) {
      throw new UnresolvedVariantError();
    }

    const canonical: CheckoutLineItem = {
      ...item,
      quantity: item.quantity,
      unitPrice: variant.retailPrice,
      name: product.name,
      image: product.images[0]?.src || item.image,
      size: variant.size,
      color: variant.color,
      printfulVariantId: `${resolved.printfulVariantId}`,
    };

    const key = keyOf(canonical);
    const existing = aggregated.get(key);
    if (existing) {
      const quantity = existing.quantity + canonical.quantity;
      if (quantity > 100) {
        throw new Error(`Quantity exceeds limit for ${canonical.productId}/${canonical.variantId}`);
      }
      aggregated.set(key, {
        ...existing,
        quantity,
      });
    } else {
      aggregated.set(key, canonical);
    }
  }

  return [...aggregated.values()].map((item) => {
    const product = DEMO_PRODUCTS.find((candidate) => candidate.id === item.productId);
    const variant = product?.variants.find((candidate) => candidate.id === item.variantId);
    if (!product || !variant) {
      throw new Error(`Unknown product/variant: ${item.productId}/${item.variantId}`);
    }

    return {
      ...item,
      productSlug: product.slug,
      canonicalUnitPrice: variant.retailPrice,
    };
  });
}

export function toStoreOrderItems(items: ValidatedLineItem[]): StoreOrderItem[] {
  return items.map((item) => ({
    id: `${item.productId}-${item.variantId}`,
    productId: item.productId,
    productSlug: item.productSlug,
    localVariantId: item.variantId,
    printfulVariantId: item.printfulVariantId,
    name: item.name,
    size: item.size,
    color: item.color,
    quantity: item.quantity,
    unitPrice: item.canonicalUnitPrice,
    image: item.image,
  }));
}
