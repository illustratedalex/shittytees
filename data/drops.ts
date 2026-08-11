export type DropTheme = 'black' | 'bone' | 'charcoal' | 'oxblood';

export type Drop = {
  id: string;
  slug: string;
  number: string;
  label: string;
  title: string;
  description: string;
  story: string;
  theme: DropTheme;
  featuredProductSlugs: string[];
  collectionSlug?: string;
  status: 'active' | 'archived' | 'upcoming';
};

function filterValidProductSlugs(slugs: string[]): string[] {
  return slugs;
}

export const DROPS: Drop[] = [
  {
    id: 'drop-001',
    slug: 'drop-001',
    number: '001',
    label: 'LIMITED RELEASE',
    title: 'Professionally Unsupervised',
    description: 'For bad ideas, long nights, and people who should probably know better.',
    story:
      'Drop 001 is a uniform for people who make it up as they go. Heavy shirts, sharp prints, and enough attitude for every late shift and after-hours detour.',
    theme: 'charcoal',
    featuredProductSlugs: filterValidProductSlugs([
      'professionally-unsupervised',
      'bad-decisions-department',
      'clocked-out-mentally',
      'not-my-circus',
      'questionable-since-birth',
      'running-on-caffeine-and-regret',
      'overqualified-underpaid',
      'tattoo-therapy',
    ]),
    collectionSlug: 'blue-collar',
    status: 'active',
  },
];

export function getDropBySlug(slug: string): Drop | undefined {
  return DROPS.find((drop) => drop.slug === slug);
}
