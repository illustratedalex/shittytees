import { getCatalogRepository } from '@/lib/catalog';
import { CheckoutLineItem } from '@/lib/validation/schemas';
import { StoreOrderItem } from '@/lib/orders/types';

type ValidatedLineItem = CheckoutLineItem & {
  productSlug: string;
  canonicalUnitPrice: number;
};

function keyOf(item: CheckoutLineItem): string {
  return `${item.productId}:${item.variantId}`;
}

export async function validateAndNormalizeCheckoutItems(items: CheckoutLineItem[]): Promise<ValidatedLineItem[]> {
  const repository = getCatalogRepository();
  const products = await repository.listPublic();
  const productsById = new Map(products.map((product) => [product.id, product]));

  const aggregated = new Map<string, CheckoutLineItem>();

  for (const item of items) {
    if (item.quantity <= 0 || item.quantity > 100) {
      throw new Error(`Invalid quantity for ${item.productId}/${item.variantId}`);
    }

    const product = productsById.get(item.productId);
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

    if (!variant.printfulVariantId) {
      throw new Error(`Missing printful variant id for ${item.productId}/${item.variantId}`);
    }

    if (item.printfulVariantId !== variant.printfulVariantId) {
      throw new Error(`Printful variant tamper detected for ${item.productId}/${item.variantId}`);
    }

    if (item.unitPrice !== variant.retailPrice) {
      throw new Error(`Price mismatch for ${item.productId}/${item.variantId}`);
    }

    const canonical: CheckoutLineItem = {
      ...item,
      quantity: item.quantity,
      unitPrice: variant.retailPrice,
      name: product.name,
      image: product.images[0]?.src || item.image,
      size: variant.size,
      color: variant.color,
      printfulVariantId: variant.printfulVariantId,
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
    const product = productsById.get(item.productId);
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
