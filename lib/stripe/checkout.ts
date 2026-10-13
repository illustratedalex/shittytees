import Stripe from 'stripe';
import { getStripe } from './client';
import { CheckoutLineItem } from '../validation/schemas';
import { ShippingAddress } from '../types/order';

export interface CreateCheckoutSessionParams {
  items: CheckoutLineItem[];
  shippingAddress: ShippingAddress;
  baseUrl: string;
  orderId: string;
  orderAccessToken: string;
  shipping: number;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const { items, shippingAddress, baseUrl, orderId, orderAccessToken, shipping } = params;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  for (const item of items) {
    const priceCents = Math.round(item.unitPrice * 100);
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${item.name} - ${item.size} ${item.color}`,
          images: [new URL(item.image, baseUrl).href],
        },
        unit_amount: priceCents,
      },
      quantity: item.quantity,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: shippingAddress.email,
    billing_address_collection: 'required',
    shipping_options: [{ shipping_rate_data: { type: 'fixed_amount', fixed_amount: { amount: Math.round(shipping * 100), currency: 'usd' }, display_name: 'Standard shipping' } }],
    custom_text: { submit: { message: `Ships to: ${shippingAddress.firstName} ${shippingAddress.lastName}, ${shippingAddress.address}${shippingAddress.addressLine2 ? ', ' + shippingAddress.addressLine2 : ''}, ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.postalCode}. Return to cart to change this address.` } },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(orderId)}&token=${encodeURIComponent(orderAccessToken)}`,
    cancel_url: `${baseUrl}/checkout/cancel`,
    metadata: {
      orderId,
      orderAccessToken,
      checkoutVersion: '2',
    },
  }, { idempotencyKey: `checkout:${orderId}` });

  if (!session.url) {
    throw new Error('Failed to create Stripe Checkout Session');
  }

  return session;
}

export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  });
}
