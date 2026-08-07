import mappingsJson from './newCandidatePrintfulMappings.json';

export type NewCandidateVariantMapping = {
  productId: string;
  variantId: string;
  printfulVariantId: number;
  syncProductId: number;
  sku: string;
  size: string;
  color: string;
  retailPrice: number;
};

export type NewCandidateProductMapping = {
  productId: string;
  slug: string;
  name: string;
  printfulProductId: number;
  syncProductId: number;
  externalProductId?: string;
  primaryImage?: string;
  backImage?: string;
  alternateImages?: string[];
  lastSyncedAt?: string;
  variants: NewCandidateVariantMapping[];
};

export const NEW_CANDIDATE_PRINTFUL_PRODUCT_MAPPINGS = mappingsJson as NewCandidateProductMapping[];
