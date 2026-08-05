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
  shortDescription: string;
  category: string;
  retailPrice: number;
  currency?: string;
  featured?: boolean;
  images: MerchImage[];
  variants: MerchVariant[];
}
