import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { metadata as contactMetadata } from '@/app/contact/layout';
import { metadata as faqMetadata } from '@/app/faq/page';
import { DEFAULT_SHARE_IMAGE_PATH } from '@/lib/seo/site';

describe('utility page metadata', () => {
  it('gives FAQ and contact their own titles, descriptions, and canonicals', () => {
    expect(faqMetadata.title).toBe('FAQ | Shitty Tees');
    expect(faqMetadata.description).toContain('damaged shirts');
    expect(faqMetadata.alternates).toEqual({ canonical: '/faq' });
    expect(contactMetadata.title).toBe('Contact | Shitty Tees');
    expect(contactMetadata.description).toContain('damaged shirt');
    expect(contactMetadata.alternates).toEqual({ canonical: '/contact' });
  });

  it('ships a default share image built from the brand mark and homepage shirt', () => {
    const image = readFileSync(path.join(process.cwd(), 'public', DEFAULT_SHARE_IMAGE_PATH.replace(/^\//, '')));
    expect(image.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(faqMetadata.openGraph?.images).toEqual([expect.objectContaining({ url: DEFAULT_SHARE_IMAGE_PATH })]);
    expect(contactMetadata.openGraph?.images).toEqual([expect.objectContaining({ url: DEFAULT_SHARE_IMAGE_PATH })]);
  });
});