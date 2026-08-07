import type { ArtworkPlacement, GarmentColor } from '@/components/product/GarmentMockup';
import { GENERATED_PRODUCT_PRESENTATIONS } from './generatedProductPresentations';

export type ProductPresentation = {
  slug: string;
  frontImage?: string;
  backImage?: string;
  detailImages?: string[];
  garmentColor?: GarmentColor;
  artworkDisplayText?: string;
  artworkPlacement?: ArtworkPlacement;
  source?: 'local' | 'printful' | 'fallback';
  lastSyncedAt?: string;
};

export const PRODUCT_PRESENTATIONS: ProductPresentation[] = [
  {
    slug: 'professionally-unsupervised',
    garmentColor: 'charcoal',
    artworkDisplayText: 'PRO. UNSUPERVISED',
    artworkPlacement: 'oversized-center',
  },
  {
    slug: 'bad-decisions-department',
    garmentColor: 'black',
    artworkDisplayText: 'BAD DECISIONS DEPT',
    artworkPlacement: 'center',
  },
  {
    slug: 'clocked-out-mentally',
    garmentColor: 'charcoal',
    artworkDisplayText: 'CLOCKED OUT',
    artworkPlacement: 'left-chest',
  },
  {
    slug: 'not-my-circus',
    garmentColor: 'black',
    artworkDisplayText: 'NOT MY CIRCUS',
    artworkPlacement: 'center',
  },
  {
    slug: 'questionable-since-birth',
    garmentColor: 'bone',
    artworkDisplayText: 'QUESTIONABLE SINCE BIRTH',
    artworkPlacement: 'center',
  },
  {
    slug: 'low-standards-club',
    garmentColor: 'black',
    artworkDisplayText: 'LOW STANDARDS CLUB',
    artworkPlacement: 'left-chest',
  },
  {
    slug: 'certified-bad-influence',
    garmentColor: 'black',
    artworkDisplayText: 'CERTIFIED BAD INFLUENCE',
    artworkPlacement: 'oversized-center',
  },
  {
    slug: 'running-on-caffeine-and-regret',
    garmentColor: 'charcoal',
    artworkDisplayText: 'CAFFEINE AND REGRET',
    artworkPlacement: 'center',
  },
  {
    slug: 'hrs-favorite-employee',
    garmentColor: 'bone',
    artworkDisplayText: 'HR FAVORITE',
    artworkPlacement: 'left-chest',
  },
  {
    slug: 'todays-bad-idea',
    garmentColor: 'black',
    artworkDisplayText: 'TODAYS BAD IDEA',
    artworkPlacement: 'center',
  },
  {
    slug: 'overqualified-underpaid',
    garmentColor: 'charcoal',
    artworkDisplayText: 'OVERQUALIFIED UNDERPAID',
    artworkPlacement: 'center',
  },
  {
    slug: 'probably-fine',
    garmentColor: 'oxblood',
    artworkDisplayText: 'PROBABLY FINE',
    artworkPlacement: 'center',
  },
  {
    slug: 'do-not-encourage-me',
    garmentColor: 'black',
    artworkDisplayText: 'DO NOT ENCOURAGE ME',
    artworkPlacement: 'back',
  },
  {
    slug: 'unsupervised-again',
    garmentColor: 'bone',
    artworkDisplayText: 'UNSUPERVISED AGAIN',
    artworkPlacement: 'center',
  },
  {
    slug: 'problem-solver-usually-the-problem',
    garmentColor: 'charcoal',
    artworkDisplayText: 'PROBLEM SOLVER',
    artworkPlacement: 'back',
  },
  {
    slug: 'socially-optional',
    garmentColor: 'black',
    artworkDisplayText: 'SOCIALLY OPTIONAL',
    artworkPlacement: 'left-chest',
  },
  {
    slug: 'no-good-decisions-after-midnight',
    garmentColor: 'oxblood',
    artworkDisplayText: 'AFTER MIDNIGHT',
    artworkPlacement: 'oversized-center',
  },
  {
    slug: 'tattoo-therapy',
    garmentColor: 'black',
    artworkDisplayText: 'TATTOO THERAPY',
    artworkPlacement: 'center',
  },
  {
    slug: 'weekend-survival-kit',
    garmentColor: 'charcoal',
    artworkDisplayText: 'WEEKEND SURVIVAL KIT',
    artworkPlacement: 'center',
  },
  {
    slug: 'everything-is-fine',
    garmentColor: 'bone',
    artworkDisplayText: 'EVERYTHING IS FINE',
    artworkPlacement: 'center',
  },
  ...GENERATED_PRODUCT_PRESENTATIONS,
];

const PRODUCT_PRESENTATION_BY_SLUG = new Map(
  PRODUCT_PRESENTATIONS.map((item) => [item.slug, item]),
);

export function getProductPresentation(slug: string): ProductPresentation | undefined {
  return PRODUCT_PRESENTATION_BY_SLUG.get(slug);
}

export function isRealProductImage(src?: string): boolean {
  if (!src) return false;
  if (src.startsWith('data:')) return false;
  return src.startsWith('/') || src.startsWith('http://') || src.startsWith('https://');
}
