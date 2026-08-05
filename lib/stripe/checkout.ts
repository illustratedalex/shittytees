import Stripe from 'stripe';
import { getStripe } from './client';
import { CheckoutLineItem } from '../validation/schemas';
import { ShippingAddress } from '../types/order';

export interface CreateCheckoutSessionParams {
  items: CheckoutLineItem[];
  shippingAddress: ShippingAddress;
  baseUrl: string;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<string> {
  const stripe = getStripe();
  const { items, shippingAddress, baseUrl } = params;

  // Validate and recalculate prices from authoritative source
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  let subtotalCents = 0;

  for (const item of items) {
    // Find product by variant
    let found = false;
    for (const p of (global as any).__allProducts || []) {
      const variant = p.variants.find((v: any) => v.id === item.variantId);
      if (variant) {
        const priceCents = Math.round(variant.retailPrice * 100);
        lineItems.push({
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${p.name} - ${variant.size} ${variant.color}`,
              images: p.images.map((img: any) => img.src),
            },
            unit_amount: priceCents,
          },
          quantity: item.quantity,
        });
        subtotalCents += priceCents * item.quantity;
        found = true;
        break;
      }
    }

    if (!found) {
      throw new Error(`Product or variant not found: ${item.productId}/${item.variantId}`);
    }
  }

  // Add shipping
  const shippingCents =
    (parseInt(process.env.STRIPE_STANDARD_SHIPPING_RATE || '1000') * 100) / 100;

  lineItems.push({
    price_data: {
      currency: 'usd',
      product_data: {
        name: 'Standard Shipping (US)',
      },
      unit_amount: Math.round(shippingCents * 100),
    },
    quantity: 1,
  });

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    line_items: lineItems,
    customer_email: shippingAddress.email,
    billing_address_collection: 'required',
    shipping_address_collection: {
      allowed_countries: ['US'],
    },
    success_url: `${baseUrl}/shittytees/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/shittytees/checkout/cancel`,
    metadata: {
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
