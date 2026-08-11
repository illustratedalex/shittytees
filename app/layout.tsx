import type { Metadata } from 'next';
import { Oswald, IBM_Plex_Sans } from 'next/font/google';
import { Providers } from './providers';
import '@/styles/globals.css';

const displayFont = Oswald({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const bodyFont = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'ShittyTees | Terrible Ideas. Excellent Shirts.',
  description: 'Independent apparel with dark humor, premium blanks, and zero interest in behaving.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ShittyTees | Terrible Ideas. Excellent Shirts.',
    description: 'Independent apparel with dark humor, premium blanks, and zero interest in behaving.',
    url: 'https://shittytees.com',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShittyTees | Terrible Ideas. Excellent Shirts.',
    description: 'Independent apparel with dark humor, premium blanks, and zero interest in behaving.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${displayFont.variable} ${bodyFont.variable} bg-[#111111] text-[#f3efe6]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
