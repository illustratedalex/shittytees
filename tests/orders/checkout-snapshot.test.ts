import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInMemoryRepository } from './helpers/inMemoryRepo';
import { processStripeEvent, StripeEventShape, StripeSessionShape } from '@/lib/orders/services/webhooks';
import { hashPublicAccessToken } from '@/lib/orders/publicAccess';

vi.mock('@/lib/orders/services/fulfillment', () => ({
  createDraftForOrder: vi.fn(), submitOrderToFulfillment: vi.fn(),
}));
import { createDraftForOrder, submitOrderToFulfillment } from '@/lib/orders/services/fulfillment';

const session: StripeSessionShape = {
  id: 'cs_test_snapshot', payment_status: 'paid', currency: 'usd', livemode: false,
  amount_subtotal: 3600, amount_total: 4075, total_details: { amount_shipping: 475, amount_tax: 0 },
  metadata: { checkoutVersion: '2', orderId: 'saved' },
};
const event: StripeEventShape = { id: 'evt_snapshot', type: 'checkout.session.completed', data: { object: session } };
async function pending() {
  const repository = createInMemoryRepository();
  await repository.create({
    id: 'saved', publicTokenHash: hashPublicAccessToken('token'), status: 'pending_payment',
    customerEmail: 'buyer@example.com',
    shippingAddress: { firstName: 'Test', lastName: 'Buyer', email: 'buyer@example.com', address: '1 Main', city: 'Boston', state: 'MA', postalCode: '02108', country: 'US' },
    stripeCheckoutSessionId: session.id, subtotal: 36, shipping: 4.75, tax: 0, total: 40.75, currency: 'USD', fulfilled: false,
    items: [{ id: 'item', productId: 'removed-from-catalog', productSlug: 'original-url', localVariantId: 'v', printfulVariantId: '123', name: 'Original shirt', size: 'M', color: 'Black', quantity: 1, unitPrice: 36, image: 'https://example.com/shirt.png' }],
  });
  return repository;
}
beforeEach(() => {
  vi.resetAllMocks();
  process.env.PRINTFUL_ENABLE_FULFILLMENT = 'false';
  process.env.PRINTFUL_ENABLE_TEST_ORDERS = 'false';
  process.env.PRINTFUL_AUTO_CONFIRM = 'false';
});
describe('saved checkout orders', () => {
  it('preserves purchased items without reading a changed catalog and ignores duplicate events', async () => {
    const repository = await pending();
    const resolve = vi.fn(async () => session);
    await processStripeEvent(repository, event, resolve);
    await processStripeEvent(repository, event, resolve);
    const order = await repository.getById('saved');
    expect(order?.status).toBe('paid');
    expect(order?.items[0].unitPrice).toBe(36);
    expect(order?.items[0].productId).toBe('removed-from-catalog');
    expect(resolve).toHaveBeenCalledTimes(1);
  });
  it('rejects a mismatched paid amount without consuming the event', async () => {
    const repository = await pending();
    await expect(processStripeEvent(repository, event, async () => ({ ...session, amount_total: 1 }))).rejects.toThrow('totals');
    expect(await repository.hasWebhookEvent('stripe', event.id)).toBe(false);
    expect((await repository.getById('saved'))?.status).toBe('pending_payment');
    await processStripeEvent(repository, event, async () => session);
    expect((await repository.getById('saved'))?.status).toBe('paid');
  });
  it('retries failed test draft creation and never confirms a test payment', async () => {
    const repository = await pending();
    process.env.PRINTFUL_ENABLE_TEST_ORDERS = 'true';
    process.env.PRINTFUL_AUTO_CONFIRM = 'true';
    vi.mocked(createDraftForOrder).mockRejectedValueOnce(new Error('Temporary outage')).mockImplementationOnce(async () => {
      return repository.transitionStatus('saved', ['paid'], 'printful_draft_created', 'stripe_webhook', undefined, { printfulOrderId: 42 });
    });
    await expect(processStripeEvent(repository, event, async () => session)).rejects.toThrow('Temporary outage');
    expect(await repository.hasWebhookEvent('stripe', event.id)).toBe(false);
    await processStripeEvent(repository, event, async () => session);
    expect(createDraftForOrder).toHaveBeenCalledTimes(2);
    expect(submitOrderToFulfillment).not.toHaveBeenCalled();
  });
});
