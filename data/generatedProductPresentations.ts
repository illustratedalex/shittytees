import presentationJson from './generatedProductPresentations.json';
import type { ArtworkPlacement, GarmentColor } from '@/components/product/GarmentMockup';

export type GeneratedProductPresentation = {
  slug: string;
  frontImage?: string;
  backImage?: string;
  detailImages?: string[];
  garmentColor?: GarmentColor;
  artworkDisplayText?: string;
  artworkPlacement?: ArtworkPlacement;
  source?: 'printful' | 'fallback';
  lastSyncedAt?: string;
};

export const GENERATED_PRODUCT_PRESENTATIONS = presentationJson as GeneratedProductPresentation[];
