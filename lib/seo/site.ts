export const SITE_ORIGIN = 'https://shittytees.com';
export const BRAND_NAME = 'Shitty Tees';
export const DEFAULT_SHARE_IMAGE_PATH = '/og/shitty-tees.png';
export const DEFAULT_SHARE_IMAGE_ALT = 'Shitty Tees. Terrible ideas. Excellent shirts.';

export function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || SITE_ORIGIN).replace(/\/+$/, '');
}

export function absoluteAssetUrl(src: string, origin = siteOrigin()): string | undefined {
  if (!src || src.startsWith('data:')) return undefined;
  if (src.startsWith('https://') || src.startsWith('http://')) return src;
  if (src.startsWith('/')) return `${origin}${src}`;
  return undefined;
}

export const defaultShareImage = {
  url: DEFAULT_SHARE_IMAGE_PATH,
  width: 1200,
  height: 630,
  alt: DEFAULT_SHARE_IMAGE_ALT,
};
