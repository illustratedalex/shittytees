import type { CSSProperties, ReactNode } from 'react';
import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';

const fontVariables = {
  '--font-display': '"Arial Narrow", "Helvetica Neue", Arial, sans-serif',
  '--font-body': '"Helvetica Neue", Arial, sans-serif',
} as CSSProperties;

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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className="bg-[#111111] text-[#f3efe6]"
        style={fontVariables}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
