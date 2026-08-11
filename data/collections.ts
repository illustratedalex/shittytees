import { getAllCollections } from '@/lib/catalog/service';

export type CollectionTheme = 'black' | 'bone' | 'charcoal' | 'oxblood';

export interface CollectionCampaign {
  slug: string;
  title: string;
  description: string;
  theme: CollectionTheme;
  href?: string;
}

export const PRIMARY_COLLECTION_SLUGS = [
  'dark-humor',
  'artists-bench',
  'tattoo-culture',
  'blue-collar',
  'limited-runs',
  'holiday-damage',
] as const;

const THEME_BY_SLUG: Record<string, CollectionTheme> = {
  'new-arrivals': 'charcoal',
  'best-sellers': 'black',
  'drop-001': 'oxblood',
  'dark-humor': 'black',
  'artists-bench': 'bone',
  'tattoo-culture': 'bone',
  'blue-collar': 'charcoal',
  'limited-runs': 'oxblood',
  'holiday-damage': 'bone',
  archive: 'charcoal',
};

export const COLLECTION_CAMPAIGNS: CollectionCampaign[] = getAllCollections().map((collection) => ({
  slug: collection.slug,
  title: collection.name,
  description: collection.description,
  theme: THEME_BY_SLUG[collection.slug] || 'charcoal',
  href: `/collections/${collection.slug}`,
}));
