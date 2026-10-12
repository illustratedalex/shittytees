import crypto from 'crypto';
import { logOrderEvent } from '@/lib/orders/logging';
import { generatePublicAccessToken, hashPublicAccessToken } from '@/lib/orders/publicAccess';
import { OrderRepository } from '@/lib/orders/repository';
import { createDraftForOrder, submitOrderToFulfillment } from '@/lib/orders/services/fulfillment';
import { CheckoutLineItem } from '@/lib/validation/schemas';
import { toStoreOrderItems, validateAndNormalizeCheckoutItems } from './checkoutSecurity';
import { StoreOrderItem } from '@/lib/orders/types';

export type StripeSessionShape = {
  id: string;
  payment_status: string;
  currency?: string | null;
  livemode?: boolean;
  customer_email?: string | null;
  payment_intent?: { id?: string } | string | null;
  amount_subtotal?: number | null;
  amount_total?: number | null;
  total_details?: {
    amount_shipping?: number | null;
    amount_tax?: number | null;
  } | null;
  metadata?: Record<string, string | undefined>;
};

export type StripeEventShape = {
  id: string;
  type: string;
  data: {
    object: StripeSessionShape;
  };
};

async function parseCartItems(metadata?: Record<string, string | undefined>): Promise<StoreOrderItem[]> {
  const raw = metadata?.cartItems;
  if (!raw) return [];

  const parsed = JSON.parse(raw) as CheckoutLineItem[];
  const normalized = await validateAndNormalizeCheckoutItems(parsed);
  return toStoreOrderItems(normalized);
}

function buildShipping(metadata: Record<string, string | undefined>, fallbackEmail: string) {
  return {
    firstName: metadata.shippingFirstName || '',
    lastName: metadata.shippingLastName || '',
    email: fallbackEmail,
    address: metadata.shippingAddress || '',
    city: metadata.shippingCity || '',
    state: metadata.shippingState || '',
    postalCode: metadata.shippingPostalCode || '',
    country: metadata.shippingCountry || 'US',
  };
}

function hashPayload(payload: unknown): string {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

export async function processStripeEvent(
  repository: OrderRepository,
  event: StripeEventShape,
  resolveSession: (sessionId: string) => Promise<StripeSessionShape>,
): Promise<void> {
  if (await repository.hasWebhookEvent('stripe', event.id)) return;
  await applyStripeEvent(repository, event, resolveSession);
  await repository.recordWebhookEvent({ provider: 'stripe', eventId: event.id, eventType: event.type, payloadHash: hashPayload(event.data.object) });
}

async function applyStripeEvent(repository: OrderRepository, event: StripeEventShape, resolveSession: (sessionId: string) => Promise<StripeSessionShape>): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = await resolveSession(event.data.object.id);
      if (session.payment_status !== 'paid') {
        return;
      }

      const metadata = session.metadata || {};
      const orderId = metadata.orderId;
      let order = await repository.getByStripeCheckoutSessionId(session.id);
      if (!order && orderId) order = await repository.getById(orderId);
      if (metadata.checkoutVersion === '2') {
        if (!order || order.id !== orderId || (order.stripeCheckoutSessionId && order.stripeCheckoutSessionId !== session.id)) {
          throw new Error('Checkout does not match a saved order');
        }
        if (session.currency?.toUpperCase() !== order.currency || session.amount_subtotal !== Math.round(order.subtotal * 100) || session.amount_total !== Math.round(order.total * 100) || session.total_details?.amount_shipping !== Math.round(order.shipping * 100) || (session.total_details?.amount_tax || 0) !== Math.round(order.tax * 100)) {
          throw new Error('Paid checkout totals do not match the saved order');
        }
        if (order.status === 'pending_payment') {
          order = await repository.transitionStatus(order.id, ['pending_payment'], 'paid', 'stripe_webhook', 'Stripe payment confirmed', {
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
          });
        }
      } else if (!order) {
        const items = await parseCartItems(metadata);
        const token = metadata.orderAccessToken || generatePublicAccessToken();
        order = await repository.create({
          id: orderId || crypto.randomUUID(), publicTokenHash: hashPublicAccessToken(token), status: 'paid',
          customerEmail: session.customer_email || '', shippingAddress: buildShipping(metadata, session.customer_email || ''),
          stripeCheckoutSessionId: session.id,
          stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
          subtotal: (session.amount_subtotal || 0) / 100, shipping: (session.total_details?.amount_shipping || 0) / 100,
          tax: (session.total_details?.amount_tax || 0) / 100, total: (session.amount_total || 0) / 100,
          currency: 'USD', fulfilled: false, items,
        });
      }
      if (!order) throw new Error('Order not found');
      const testDraft = session.livemode === false && process.env.PRINTFUL_ENABLE_TEST_ORDERS === 'true';
      if (order.status === 'paid' && (process.env.PRINTFUL_ENABLE_FULFILLMENT === 'true' || testDraft)) {
        order = await createDraftForOrder(repository, order.id, 'stripe_webhook', testDraft);
      }
      if (session.livemode === true && process.env.PRINTFUL_ENABLE_FULFILLMENT === 'true' && process.env.PRINTFUL_AUTO_CONFIRM === 'true' && order.status === 'printful_draft_created' && order.printfulOrderId) {
        await submitOrderToFulfillment(repository, order.id, 'stripe_webhook');
      }

      logOrderEvent('order.payment_confirmed', {
        orderId: order.id,
        stripeEventId: event.id,
        status: 'paid',
      });
      return;
    }

    case 'checkout.session.async_payment_failed': {
      const sessionId = event.data.object.id;
      const order = await repository.getByStripeCheckoutSessionId(sessionId);
      if (!order) return;
      await repository.transitionStatus(order.id, ['pending_payment', 'paid'], 'failed', 'stripe_webhook', 'Async payment failed');
      return;
    }

    case 'charge.refunded': {
      const paymentIntent = typeof event.data.object.payment_intent === 'string' ? event.data.object.payment_intent : undefined;
      if (!paymentIntent) return;
      const order = await repository.getByStripePaymentIntentId(paymentIntent);
      if (!order) return;
      await repository.transitionStatus(order.id, ['paid', 'printful_draft_created', 'submitted_to_printful', 'in_fulfillment', 'shipped'], 'refunded', 'stripe_webhook', 'Charge refunded');
      return;
    }

    default:
      return;
  }
}

export type PrintfulEventShape = {
  id?: string;
  type: string;
  data?: {
    order?: {
      id?: number;
      external_id?: string;
    };
    shipment?: {
      tracking_number?: string;
      tracking_url?: string;
    };
  };
};

export async function processPrintfulEvent(repository: OrderRepository, event: PrintfulEventShape): Promise<void> {
  const fallbackEventId = `${event.type}:${event.data?.order?.id || 'unknown'}`;
  const eventId = event.id || fallbackEventId;

  const inserted = await repository.recordWebhookEvent({
    provider: 'printful',
    eventId,
    eventType: event.type,
    payloadHash: hashPayload(event),
  });

  if (!inserted) {
    return;
  }

  const printfulOrderId = event.data?.order?.id;
  if (!printfulOrderId) {
    return;
  }

  const order = await repository.getByPrintfulOrderId(printfulOrderId);
  if (!order) {
    logOrderEvent('printful.webhook.unknown_order', {
      printfulOrderId,
      eventType: event.type,
    });
    return;
  }

  switch (event.type) {
    case 'order_failed':
    case 'order_canceled':
    case 'package_returned': {
      await repository.transitionStatus(order.id, ['printful_draft_created', 'submitted_to_printful', 'in_fulfillment'], 'failed', 'printful_webhook', event.type);
      return;
    }
    case 'package_shipped': {
      await repository.transitionStatus(order.id, ['submitted_to_printful', 'in_fulfillment'], 'shipped', 'printful_webhook', 'Package shipped', {
        trackingNumber: event.data?.shipment?.tracking_number,
        trackingUrl: event.data?.shipment?.tracking_url,
      });
      return;
    }
    case 'order_updated': {
      if (order.status === 'submitted_to_printful') {
        await repository.transitionStatus(order.id, ['submitted_to_printful'], 'in_fulfillment', 'printful_webhook', 'Order in fulfillment');
      }
      return;
    }
    default:
      return;
  }
}
