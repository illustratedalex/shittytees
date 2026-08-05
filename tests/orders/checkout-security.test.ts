import { describe, expect, it } from 'vitest';
import { validateAndNormalizeCheckoutItems } from '@/lib/orders/services/checkoutSecurity';
import { DEMO_PRODUCTS } from '@/lib/data/products';

const product = DEMO_PRODUCTS[0];
const variant = product.variants[0];

function lineItem(overrides: Partial<{
  productId: string;
  variantId: string;
  quantity: number;
  name: string;
  image: string;
  size: string;
  color: string;
  unitPrice: number;
  printfulVariantId: string;
}> = {}) {
  return {
    productId: product.id,
    variantId: variant.id,
    quantity: 1,
    name: product.name,
    image: product.images[0].src,
    size: variant.size,
    color: variant.color,
    unitPrice: variant.retailPrice,
    printfulVariantId: '300000',
    ...overrides,
  };
}

describe('checkout tamper rejection', () => {
  it('rejects unknown product', () => {
    expect(() => validateAndNormalizeCheckoutItems([lineItem({ productId: 'missing' }) as any])).toThrow();
  });

  it('rejects unknown variant', () => {
    expect(() => validateAndNormalizeCheckoutItems([lineItem({ variantId: 'missing' }) as any])).toThrow();
  });

  it('rejects size color mismatch', () => {
    expect(() => validateAndNormalizeCheckoutItems([lineItem({ size: 'BAD', color: 'BAD' }) as any])).toThrow();
  });

  it('rejects zero and excessive quantity', () => {
    expect(() => validateAndNormalizeCheckoutItems([lineItem({ quantity: 0 }) as any])).toThrow();
    expect(() => validateAndNormalizeCheckoutItems([lineItem({ quantity: 101 }) as any])).toThrow();
  });

  it('normalizes duplicate lines safely', () => {
    const rows = validateAndNormalizeCheckoutItems([lineItem(), lineItem() as any]);
    expect(rows.length).toBe(1);
    expect(rows[0].quantity).toBe(2);
  });

  it('rejects client unit price tampering', () => {
    expect(() => validateAndNormalizeCheckoutItems([lineItem({ unitPrice: variant.retailPrice + 100 }) as any])).toThrow();
  });
});
