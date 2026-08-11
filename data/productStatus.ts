import statusOverrides from './productStatusOverrides.json';

export type ProductPublishStatus = 'published' | 'draft' | 'archive' | 'disabled';

export const PRODUCT_STATUS_OVERRIDES = statusOverrides as Record<string, ProductPublishStatus>;

export function getProductStatusOverride(slug: string): ProductPublishStatus | undefined {
  return PRODUCT_STATUS_OVERRIDES[slug];
}
