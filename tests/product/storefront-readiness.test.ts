import { describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/products/imageResolver', () => ({ resolveProductImage: vi.fn() }));
import { resolveProductImage } from '@/lib/products/imageResolver';
import { isStorefrontProductReady } from '@/lib/products/storefrontReadiness';
import type { Product } from '@/lib/types/product';
const product = { description: 'An original graphic shirt.', shortDescription: 'Wear your bad attitude.', variants: [{ available: true, printfulVariantId: '123' }] } as Product;
describe('storefront presentation gate', () => {
 it('keeps placeholder and artwork-only images out of the buyable grid', () => {
  vi.mocked(resolveProductImage).mockReturnValue({ src: 'placeholder', alt: '', source: 'placeholder', isPreview: true, role: 'unknown' });
  expect(isStorefrontProductReady(product)).toBe(false);
  vi.mocked(resolveProductImage).mockReturnValue({ src: 'art', alt: '', source: 'artwork', isPreview: true, role: 'artwork' });
  expect(isStorefrontProductReady(product)).toBe(false);
 });
 it('requires a shirt image, an available mapping, and finished customer copy', () => {
  vi.mocked(resolveProductImage).mockReturnValue({ src: 'shirt', alt: '', source: 'printful', isPreview: false, role: 'front-flat' });
  expect(isStorefrontProductReady(product)).toBe(true);
  expect(isStorefrontProductReady({ ...product, description: 'Imported from Printful. Update this description before publishing.' })).toBe(false);
  expect(isStorefrontProductReady({ ...product, variants: [] })).toBe(false);
 });
});
