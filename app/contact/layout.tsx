import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { defaultShareImage } from '@/lib/seo/site';

const title = 'Contact | Shitty Tees';
const description = 'Send a note about an order, a damaged shirt, or anything else. Shitty Tees will get back to you.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/contact' },
  openGraph: {
    title,
    description,
    url: '/contact',
    type: 'website',
    images: [defaultShareImage],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
