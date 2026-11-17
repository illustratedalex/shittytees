import { beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('@/lib/printful/client', () => ({ printfulRequest: vi.fn() }));
vi.mock('@/lib/printful/products', () => ({ getSyncVariant: vi.fn() }));
import { printfulRequest } from '@/lib/printful/client';
import { getSyncVariant } from '@/lib/printful/products';
import { quoteStandardShipping } from '@/lib/printful/shipping';
import type { StoreOrderItem } from '@/lib/orders/types';

const item: StoreOrderItem = { id: 'i', productId: 'p', productSlug: 'shirt', localVariantId: 'v', printfulVariantId: '12345', name: 'Shirt', size: 'M', color: 'Black', quantity: 2, unitPrice: 36, image: 'https://example.com/shirt.png' };
const address = { firstName: 'Test', lastName: 'Buyer', email: 'buyer@example.com', address: '1 Main', city: 'Boston', state: 'ma', postalCode: '02108', country: 'US' };
beforeEach(() => vi.resetAllMocks());
describe('destination shipping quotes', () => {
  it('uses catalog IDs rather than sync IDs and the actual destination', async () => {
    vi.mocked(getSyncVariant).mockResolvedValue({ id: 12345, variant_id: 4012 } as any);
    vi.mocked(printfulRequest).mockResolvedValue({ code: 200, result: [{ id: 'STANDARD', rate: '5.25', currency: 'USD' }] });
    expect(await quoteStandardShipping([item], address)).toBe(5.25);
    const payload = JSON.parse(vi.mocked(printfulRequest).mock.calls[0][1]?.body as string);
    expect(payload.items).toEqual([{ variant_id: 4012, quantity: 2 }]);
    expect(payload.recipient).toMatchObject({ state_code: 'MA', zip: '02108', address1: '1 Main' });
  });
  it('refuses checkout when no supported shipping rate is returned', async () => {
    vi.mocked(getSyncVariant).mockResolvedValue({ id: 12345, variant_id: 4012 } as any);
    vi.mocked(printfulRequest).mockResolvedValue({ code: 200, result: [] });
    await expect(quoteStandardShipping([item], address)).rejects.toThrow('unavailable');
  });
});
