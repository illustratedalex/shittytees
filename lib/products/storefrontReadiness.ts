import { resolveProductImage } from './imageResolver';
import type { Product } from '@/lib/types/product';

export function isStorefrontProductReady(product: Product): boolean {
  const image = resolveProductImage(product);
  const draftCopy = /review copy|update this description|imported from printful|new from printful|placeholder/i.test(`${product.description} ${product.shortDescription}`);
  return !draftCopy && image.source !== 'placeholder' && !image.isPreview && product.variants.some((variant) => variant.available && Boolean(variant.printfulVariantId));
}
