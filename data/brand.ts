export interface BrandData {
  name: string;
  shortName: string;
  tagline: string;
  heroHeadline: string;
  heroSubhead: string;
  heroKicker: string;
  newsletterTitle: string;
  newsletterBody: string;
  socialPlaceholder: Array<{ platform: string; label: string }>;
  footerCopy: string;
}

export const BRAND: BrandData = {
  name: 'ShittyTees',
  shortName: 'ST',
  tagline: 'Terrible Ideas. Excellent Shirts.',
  heroHeadline: 'Terrible Ideas.\nExcellent Shirts.',
  heroSubhead: 'Independent apparel with dark humor, premium blanks, and zero interest in behaving.',
  heroKicker: 'Independent apparel for questionable people',
  newsletterTitle: 'Join the bad influence.',
  newsletterBody: 'New drops, limited runs, and occasional terrible decisions.',
  socialPlaceholder: [
    { platform: 'Instagram', label: '@shittytees' },
    { platform: 'TikTok', label: '@shittytees' },
  ],
  footerCopy: 'Built & Managed by DeadSignal',
};
