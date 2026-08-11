export type NavigationLink = {
  label: string;
  href: string;
};

export interface NavigationData {
  header: NavigationLink[];
  footerPrimary: NavigationLink[];
  footerLegal: NavigationLink[];
}

export const NAVIGATION: NavigationData = {
  header: [
    { label: 'Shop', href: '/shop' },
    { label: 'Drop 001', href: '/drops/drop-001' },
    { label: 'Collections', href: '/collections' },
    { label: 'About', href: '/about' },
    { label: 'Cart', href: '/cart' },
  ],
  footerPrimary: [
    { label: 'Shop', href: '/shop' },
    { label: 'Drops', href: '/drops/drop-001' },
    { label: 'Collections', href: '/collections' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Returns', href: '/returns' },
    { label: 'Contact', href: '/contact' },
  ],
  footerLegal: [
    { label: 'Privacy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
  ],
};
