import { afterEach, describe, expect, it, vi } from 'vitest';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

vi.mock('@/lib/catalog/service', () => ({
  getPublicProducts: vi.fn(async () => [
    { slug: 'public-shirt', active: true, updatedAt: '2026-10-01T00:00:00Z' },
    { slug: 'inactive-shirt', active: false, updatedAt: '2026-10-01T00:00:00Z' },
  ]),
  getAllCollections: vi.fn(() => [{ slug: 'shitty-politics' }]),
}));

afterEach(() => vi.unstubAllEnvs());

describe('public crawl routes', () => {
  it('uses the root-mounted storefront routes and excludes inactive products', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://shittytees.com/');
    const urls = (await sitemap()).map(({ url }) => url);
    expect(urls).toEqual([
      'https://shittytees.com/',
      'https://shittytees.com/shop',
      'https://shittytees.com/collections',
      'https://shittytees.com/about',
      'https://shittytees.com/faq',
      'https://shittytees.com/contact',
      'https://shittytees.com/privacy',
      'https://shittytees.com/terms',
      'https://shittytees.com/returns',
      'https://shittytees.com/shop/public-shirt',
      'https://shittytees.com/collections/shitty-politics',
    ]);
  });

  it('addresses the actual non-public routes and a valid sitemap URL', () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://shittytees.com/');
    const result = robots();
    expect(result.sitemap).toBe('https://shittytees.com/sitemap.xml');
    expect(result.rules).toEqual([{
      userAgent: '*',
      allow: '/',
      disallow: expect.arrayContaining(['/cart', '/checkout', '/workspace', '/admin', '/order/', '/api/']),
    }]);
  });
});
