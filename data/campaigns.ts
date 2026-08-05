import { BRAND } from './brand';
import { COLLECTION_CAMPAIGNS } from './collections';

export interface CampaignHeroContent {
  eyebrow: string;
  headline: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  campaignLabel?: string;
  theme: 'dark' | 'light';
}

export interface HomepageCampaignContent {
  hero: CampaignHeroContent;
  marqueeItems: string[];
  editorialStatement: string;
  collectionBands: typeof COLLECTION_CAMPAIGNS;
}

export const HOMEPAGE_CAMPAIGN: HomepageCampaignContent = {
  hero: {
    eyebrow: BRAND.heroKicker,
    headline: BRAND.heroHeadline,
    body: BRAND.heroSubhead,
    primaryCtaLabel: 'Shop Drop 001',
    primaryCtaHref: '/drops/drop-001',
    secondaryCtaLabel: 'View All Collections',
    secondaryCtaHref: '/collections',
    campaignLabel: 'Drop 001 / Limited Release',
    theme: 'dark',
  },
  marqueeItems: ['Drop 001', 'Independent Apparel', 'Questionable People', 'Premium Blanks'],
  editorialStatement:
    'Made for tattoo shops, garages, dive bars, night shifts, bad decisions, and people who laugh at the wrong time.',
  collectionBands: COLLECTION_CAMPAIGNS,
};
