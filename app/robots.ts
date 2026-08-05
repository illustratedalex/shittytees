import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shittytees.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/shittytees/', '/shittytees/shop', '/shittytees/collections', '/shittytees/about', '/shittytees/faq', '/shittytees/contact', '/shittytees/privacy', '/shittytees/terms', '/shittytees/returns'],
        disallow: ['/shittytees/cart', '/shittytees/checkout', '/shittytees/workspace', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
