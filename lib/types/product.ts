export type ProductPublishStatus = 'published' | 'draft' | 'archive' | 'disabled';

export interface ProductVariant {
  id: string;
  printfulVariantId: string;
  printfulSyncVariantId?: string;
  printfulCatalogVariantId?: string;
  printfulVariantExternalId?: string;
  name: string;
  size: string;
  color: string;
  colorHex: string;
  sku: string;
  retailPrice: number;
  available: boolean;
}

export interface Product {
  id: string;
  printfulProductId?: string;
  printfulExternalId?: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  collectionSlug: string;
  active: boolean;
  publishStatus: ProductPublishStatus;
  featured: boolean;
  images: {
    id: string;
    src: string;
    alt: string;
  }[];
  basePrice: number;
  retailPrice: number;
  currency: string;
  variants: ProductVariant[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Collection {
  id: string;
  slug: string;
  name: string;
  description: string;
  image?: {
    src: string;
    alt: string;
  };
}
