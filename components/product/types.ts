export interface MerchVariant {
  id: string;
  color?: string;
  colorHex?: string;
}

export interface MerchImage {
  id: string;
  src: string;
  alt: string;
}

export interface MerchProduct {
  id: string;
  slug: string;
  name: string;
  description?: string;
  shortDescription: string;
  category: string;
  collectionSlug?: string;
  retailPrice: number;
  currency?: string;
  featured?: boolean;
  tags?: string[];
  images: MerchImage[];
  variants: MerchVariant[];
}
