import { DEMO_PRODUCTS } from '@/lib/data/products';
import { PRINTFUL_PRODUCT_MAPPINGS, findPrintfulProductMappingByProductId, findPrintfulVariantMapping } from '@/data/printfulMappings';

export type PrintfulMappingReport = {
  products: number;
  variants: number;
  mappedProducts: number;
  mappedVariants: number;
};

export function getPrintfulMappingReport(): PrintfulMappingReport {
  const products = DEMO_PRODUCTS.length;
  const variants = DEMO_PRODUCTS.reduce((count, product) => count + product.variants.length, 0);
  const mappedProducts = PRINTFUL_PRODUCT_MAPPINGS.filter((mapping) => Boolean(mapping.printfulProductId)).length;
  const mappedVariants = PRINTFUL_PRODUCT_MAPPINGS.reduce((count, mapping) => count + mapping.variants.length, 0);

  return {
    products,
    variants,
    mappedProducts,
    mappedVariants,
  };
}

export function getPrintfulMappingSummary(): string {
  const report = getPrintfulMappingReport();
  return `${report.mappedProducts}/${report.products} products mapped, ${report.mappedVariants}/${report.variants} variants mapped`;
}

export function findMappingByProductId(productId: string) {
  return findPrintfulProductMappingByProductId(productId);
}

export function findMappingByVariantId(productId: string, variantId: string) {
  return findPrintfulVariantMapping(productId, variantId);
}
