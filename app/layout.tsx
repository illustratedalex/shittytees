import type { Metadata } from 'next';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'ShittyTees - Terrible Ideas. Excellent Shirts.',
  description: 'Print-on-demand apparel for people with questionable taste.',
  openGraph: {
    title: 'ShittyTees',
    description: 'Printed on demand. Shipped straight to your door.',
    url: 'https://shittytees.com',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-white text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
