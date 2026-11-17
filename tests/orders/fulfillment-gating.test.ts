import { describe, expect, it, vi } from 'vitest';
import { createInMemoryRepository } from './helpers/inMemoryRepo';
import { hashPublicAccessToken } from '@/lib/orders/publicAccess';

vi.mock('@/lib/printful/orders', () => ({
  confirmPrintfulOrder: vi.fn(async () => ({ id: 90210, status: 'pending', external_id: 'ext_1' })),
  createPrintfulDraftOrder: vi.fn(async () => ({ id: 90210, external_id: 'ext_1' })),
}));

import { createDraftForOrder, submitOrderToFulfillment } from '@/lib/orders/services/fulfillment';
import {confirmPrintfulOrder} from '@/lib/printful/orders';

function baseOrder(status: 'paid' | 'printful_draft_created' = 'paid') {
  return {
    id: 'ord_gate',
    publicTokenHash: hashPublicAccessToken('tok'),
    status,
    customerEmail: 'buyer@example.com',
    shippingAddress: {
      firstName: 'A',
      lastName: 'B',
      email: 'buyer@example.com',
      address: '1 Main',
      city: 'X',
      state: 'TX',
      postalCode: '73301',
      country: 'US',
    },
    subtotal: 10,
    shipping: 2,
    tax: 0,
    total: 12,
    currency: 'USD',
    fulfilled: false,
    items: [
      {
        id: 'item1',
        productId: 'p',
        productSlug: 'slug',
        localVariantId: 'v',
        printfulVariantId: '300001',
        name: 'Item',
        size: 'M',
        color: 'Black',
        quantity: 1,
        unitPrice: 10,
        image: 'https://img',
      },
    ],
    printfulOrderId: status === 'printful_draft_created' ? 90210 : undefined,
  };
}

describe('fulfillment gating', () => {
  it('keeps a rejected provider confirmation retryable instead of reporting fulfillment',async()=>{
    process.env.PRINTFUL_ENABLE_FULFILLMENT='true';
    const repository=createInMemoryRepository();
    await repository.create(baseOrder('printful_draft_created'));
    vi.mocked(confirmPrintfulOrder).mockResolvedValueOnce({id:90210,status:'failed',external_id:'ext_1'});
    await expect(submitOrderToFulfillment(repository,'ord_gate','stripe_webhook')).rejects.toThrow('not accepted');
    const saved=await repository.getById('ord_gate');
    expect(saved?.status).toBe('printful_draft_created');expect(saved?.fulfilled).toBe(false);expect(saved?.mappingError).toContain('failed');
  });
  it('permits test drafts without permitting test fulfillment', async () => {
    process.env.PRINTFUL_ENABLE_FULFILLMENT = 'false';
    process.env.PRINTFUL_ENABLE_TEST_ORDERS = 'true';
    const repository = createInMemoryRepository();
    await repository.create({ ...baseOrder(), stripeCheckoutSessionId: 'cs_test_draft' });
    const draft = await createDraftForOrder(repository, 'ord_gate', 'stripe_webhook', true);
    expect(draft.status).toBe('printful_draft_created');
    process.env.PRINTFUL_ENABLE_FULFILLMENT = 'true';
    await expect(submitOrderToFulfillment(repository, 'ord_gate', 'admin_action')).rejects.toThrow('Test payments');
    delete process.env.PRINTFUL_ENABLE_TEST_ORDERS;
  });

  it('blocks draft creation when fulfillment disabled', async () => {
    process.env.PRINTFUL_ENABLE_FULFILLMENT = 'false';
    const repository = createInMemoryRepository();
    await repository.create(baseOrder('paid') as any);
    await expect(createDraftForOrder(repository, 'ord_gate', 'admin_action')).rejects.toThrow('disabled');
  });

  it('allows only exact true gate value', async () => {
    process.env.PRINTFUL_ENABLE_FULFILLMENT = 'TRUE';
    const repository = createInMemoryRepository();
    await repository.create(baseOrder('paid') as any);
    await expect(createDraftForOrder(repository, 'ord_gate', 'admin_action')).rejects.toThrow('disabled');
  });

  it('creates one draft and blocks duplicate creation after status change', async () => {
    process.env.PRINTFUL_ENABLE_FULFILLMENT = 'true';
    const repository = createInMemoryRepository();
    await repository.create(baseOrder('paid') as any);

    const first = await createDraftForOrder(repository, 'ord_gate', 'admin_action');
    expect(first.status).toBe('printful_draft_created');

    await expect(createDraftForOrder(repository, 'ord_gate', 'admin_action')).rejects.toThrow('must be paid');
  });

  it('blocks submit when draft missing', async () => {
    process.env.PRINTFUL_ENABLE_FULFILLMENT = 'true';
    const repository = createInMemoryRepository();
    await repository.create(baseOrder('paid') as any);
    await expect(submitOrderToFulfillment(repository, 'ord_gate', 'admin_action')).rejects.toThrow();
  });

  it('submits when draft exists', async () => {
    process.env.PRINTFUL_ENABLE_FULFILLMENT = 'true';
    const repository = createInMemoryRepository();
    await repository.create(baseOrder('printful_draft_created') as any);
    const submitted = await submitOrderToFulfillment(repository, 'ord_gate', 'admin_action');
    expect(submitted.status).toBe('submitted_to_printful');
  });
});
