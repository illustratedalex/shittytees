import { describe, expect, it } from 'vitest';
import { validateAndNormalizeCheckoutItems } from '@/lib/orders/services/checkoutSecurity';
import { DEMO_PRODUCTS } from '@/lib/data/products';

const mappedFixture = DEMO_PRODUCTS
  .flatMap((candidate) =>
    candidate.variants.map((candidateVariant) => ({ product: candidate, variant: candidateVariant })),
  )
  .find(({ variant: candidateVariant }) => Boolean(candidateVariant.available && candidateVariant.printfulVariantId));

if (!mappedFixture) {
  throw new Error('Expected at least one fulfillment-ready product variant fixture.');
}

const product = mappedFixture.product;
const variant = mappedFixture.variant;
const mappedVariantId = variant.printfulVariantId;

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
    printfulVariantId: mappedVariantId,
    ...overrides,
  };
}

describe('checkout tamper rejection', () => {
  it('rejects unknown product', async () => {
    await expect(validateAndNormalizeCheckoutItems([lineItem({ productId: 'missing' }) as any])).rejects.toThrow();
  });

  it('rejects unknown variant', async () => {
    await expect(validateAndNormalizeCheckoutItems([lineItem({ variantId: 'missing' }) as any])).rejects.toThrow();
  });

  it('rejects size color mismatch', async () => {
    await expect(validateAndNormalizeCheckoutItems([lineItem({ size: 'BAD', color: 'BAD' }) as any])).rejects.toThrow();
  });

  it('rejects zero and excessive quantity', async () => {
    await expect(validateAndNormalizeCheckoutItems([lineItem({ quantity: 0 }) as any])).rejects.toThrow();
    await expect(validateAndNormalizeCheckoutItems([lineItem({ quantity: 101 }) as any])).rejects.toThrow();
  });

  it('normalizes duplicate lines safely', async () => {
    const rows = await validateAndNormalizeCheckoutItems([lineItem(), lineItem() as any]);
    expect(rows.length).toBe(1);
    expect(rows[0].quantity).toBe(2);
  });

  it('rejects client unit price tampering', async () => {
    await expect(validateAndNormalizeCheckoutItems([lineItem({ unitPrice: variant.retailPrice + 100 }) as any])).rejects.toThrow();
  });
});
