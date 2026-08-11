import { DEMO_PRODUCTS } from '@/lib/data/products';
import { getPrintfulMappingReport, getPrintfulMappingSummary } from './mappers';
import { getAvailableProducts } from './products';

export type PrintfulInspectionResult = {
  localProducts: number;
  localVariants: number;
  mappedSummary: string;
  remoteProducts?: number;
  remoteAvailableProducts?: number;
  connected: boolean;
};

export async function inspectPrintfulCatalog(): Promise<PrintfulInspectionResult> {
  const report = getPrintfulMappingReport();

  try {
    const remoteProducts = await getAvailableProducts();
    return {
      localProducts: report.products,
      localVariants: report.variants,
      mappedSummary: getPrintfulMappingSummary(),
      remoteProducts: remoteProducts.length,
      remoteAvailableProducts: remoteProducts.length,
      connected: true,
    };
  } catch (error) {
    return {
      localProducts: report.products,
      localVariants: report.variants,
      mappedSummary: getPrintfulMappingSummary(),
      connected: false,
    };
  }
}

export async function buildPrintfulSyncPlan(): Promise<Array<{ productId: string; slug: string; name: string }>> {
  return DEMO_PRODUCTS.map((product) => ({
    productId: product.id,
    slug: product.slug,
    name: product.name,
  }));
}
