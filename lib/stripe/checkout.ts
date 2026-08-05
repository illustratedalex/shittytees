import Stripe from 'stripe';
import { getStripe } from './client';
import { CheckoutLineItem } from '../validation/schemas';
import { ShippingAddress } from '../types/order';
import { DEMO_PRODUCTS } from '../data/products';
import { resolveVariant } from '../fulfillment/resolveVariant';

export interface CreateCheckoutSessionParams {
  items: CheckoutLineItem[];
  shippingAddress: ShippingAddress;
  baseUrl: string;
  orderId: string;
  orderAccessToken: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<string> {
  const stripe = getStripe();
  const { items, shippingAddress, baseUrl, orderId, orderAccessToken } = params;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotalCents = 0;

  for (const item of items) {
    const matchedProduct = DEMO_PRODUCTS.find((product) => product.id === item.productId);

    if (!matchedProduct) {
      throw new Error(`Product not found: ${item.productId}`);
    }

    const variant = matchedProduct.variants.find((candidate) => candidate.id === item.variantId);
    if (!variant) {
      throw new Error(`Product or variant not found: ${item.productId}/${item.variantId}`);
    }

    resolveVariant(item);

    const priceCents = Math.round(variant.retailPrice * 100);
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${matchedProduct.name} - ${variant.size} ${variant.color}`,
          images: matchedProduct.images.map((image) => image.src),
        },
        unit_amount: priceCents,
      },
      quantity: item.quantity,
    });
    subtotalCents += priceCents * item.quantity;
  }

  const shippingDollars = Number(process.env.STRIPE_STANDARD_SHIPPING_RATE || '10');
  const shippingCents = Math.round(shippingDollars * 100);

  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Standard Shipping (US)',
      },
      unit_amount: shippingCents,
    },
    quantity: 1,
  });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    customer_email: shippingAddress.email,
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${encodeURIComponent(orderId)}&token=${encodeURIComponent(orderAccessToken)}`,
    cancel_url: `${baseUrl}/checkout/cancel`,
    metadata: {
      orderId,
      orderAccessToken,
      shippingFirstName: shippingAddress.firstName,
      shippingLastName: shippingAddress.lastName,
      shippingAddress: shippingAddress.address,
      shippingCity: shippingAddress.city,
      shippingState: shippingAddress.state,
      shippingPostalCode: shippingAddress.postalCode,
      shippingCountry: shippingAddress.country,
      cartItems: JSON.stringify(items),
    },
  });

  if (!session.url) {
    throw new Error('Failed to create Stripe Checkout Session');
  }

  return session.url;
}

export async function getCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'payment_intent'],
  });
}
