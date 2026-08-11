import { ProductPresentation } from '@/data/productPresentation';
import { ImportedPrintfulProduct } from './catalog-import';

export type PresentationSource = 'local' | 'printful' | 'fallback';

export type ImportedPresentationPatch = ProductPresentation & {
  source: PresentationSource;
  lastSyncedAt: string;
};

export function buildPresentationPatch(
  imported: ImportedPrintfulProduct,
  existing?: ProductPresentation,
): ImportedPresentationPatch {
  if (existing?.frontImage) {
    return {
      ...existing,
      source: 'local',
      lastSyncedAt: imported.lastSyncedAt,
    };
  }

  const front = imported.mockups.front || imported.mockups.back || imported.mockups.alternate?.[0];
  const back = imported.mockups.back || imported.mockups.alternate?.[1];
  const detailImages = [front, back, ...(imported.mockups.alternate || [])].filter((value): value is string => Boolean(value));

  if (front || back || detailImages.length) {
    return {
      slug: imported.localSlug,
      frontImage: front,
      backImage: back,
      detailImages,
      artworkDisplayText: imported.name,
      artworkPlacement: 'center',
      garmentColor: existing?.garmentColor || 'charcoal',
      source: 'printful',
      lastSyncedAt: imported.lastSyncedAt,
    };
  }

  return {
    slug: imported.localSlug,
    garmentColor: existing?.garmentColor || 'charcoal',
    artworkDisplayText: imported.name,
    artworkPlacement: existing?.artworkPlacement || 'center',
    source: 'fallback',
    lastSyncedAt: imported.lastSyncedAt,
  };
}
