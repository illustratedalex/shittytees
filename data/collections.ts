import { getAllCollections } from '@/lib/data/products';

export type CollectionTheme = 'black' | 'bone' | 'charcoal' | 'oxblood';

export interface CollectionCampaign {
  slug: string;
  title: string;
  description: string;
  theme: CollectionTheme;
  href?: string;
}

const THEME_BY_SLUG: Record<string, CollectionTheme> = {
  'new-arrivals': 'charcoal',
  'best-sellers': 'black',
  'drop-001': 'oxblood',
  'dark-humor': 'black',
  'tattoo-culture': 'bone',
  'blue-collar': 'charcoal',
};

export const COLLECTION_CAMPAIGNS: CollectionCampaign[] = getAllCollections().map((collection) => ({
  slug: collection.slug,
  title: collection.name,
  description: collection.description,
  theme: THEME_BY_SLUG[collection.slug] || 'charcoal',
  href: '/collections',
}));
