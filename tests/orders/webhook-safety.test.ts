import { describe, expect, it } from 'vitest';
import { processPrintfulEvent, processStripeEvent } from '@/lib/orders/services/webhooks';
import { createInMemoryRepository } from './helpers/inMemoryRepo';
import { hashPublicAccessToken } from '@/lib/orders/publicAccess';

describe('webhook idempotency and safety', () => {
  it('processes stripe completed once for duplicate event id', async () => {
    const repository = createInMemoryRepository();
    const event = {
      id: 'evt_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_1',
          payment_status: 'paid',
          customer_email: 'buyer@example.com',
          amount_subtotal: 1000,
          amount_total: 1200,
          total_details: { amount_shipping: 200, amount_tax: 0 },
          metadata: {
            orderId: 'ord_1',
            orderAccessToken: 'tok_1',
            cartItems: JSON.stringify([]),
          },
        },
      },
    } as any;

    const resolver = async () => event.data.object;

    await processStripeEvent(repository, event, resolver);
    await processStripeEvent(repository, event, resolver);

    const list = await repository.list();
    expect(list.orders.length).toBe(1);
    expect(list.orders[0].id).toBe('ord_1');
  });

  it('does not mark paid when session is not paid', async () => {
    const repository = createInMemoryRepository();
    const event = {
      id: 'evt_2',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_2', payment_status: 'unpaid', metadata: { cartItems: '[]' } } },
    } as any;

    const resolver = async () => event.data.object;
    await processStripeEvent(repository, event, resolver);
    const list = await repository.list();
    expect(list.orders.length).toBe(0);
  });

  it('handles unknown printful order safely', async () => {
    const repository = createInMemoryRepository();
    await processPrintfulEvent(repository, {
      id: 'p_1',
      type: 'package_shipped',
      data: { order: { id: 12345 } },
    });

    const list = await repository.list();
    expect(list.orders.length).toBe(0);
  });

  it('updates shipped once for duplicate printful event id', async () => {
    const repository = createInMemoryRepository();
    await repository.create({
      id: 'ord_ship',
      publicTokenHash: hashPublicAccessToken('shiptok'),
      status: 'submitted_to_printful',
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
      printfulOrderId: 555,
      items: [],
    });

    const event = {
      id: 'p_evt',
      type: 'package_shipped',
      data: { order: { id: 555 }, shipment: { tracking_number: '1Z', tracking_url: 'https://track' } },
    } as any;

    await processPrintfulEvent(repository, event);
    await processPrintfulEvent(repository, event);

    const order = await repository.getById('ord_ship');
    expect(order?.status).toBe('shipped');
    expect(order?.trackingNumber).toBe('1Z');
  });
});
