import { describe, expect, it } from 'vitest';
import nextConfig from '../../next.config';

describe('www host redirect', () => {
  it('permanently redirects every www path to the apex', async () => {
    const redirects = await nextConfig.redirects?.();

    expect(redirects).toEqual([
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.shittytees.com' }],
        destination: 'https://shittytees.com/:path*',
        permanent: true,
      },
    ]);
  });
});