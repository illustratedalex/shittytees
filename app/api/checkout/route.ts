import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { CheckoutRequestSchema } from '@/lib/validation/schemas';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { generatePublicAccessToken, hashPublicAccessToken } from '@/lib/orders/publicAccess';
import { toStoreOrderItems, validateAndNormalizeCheckoutItems } from '@/lib/orders/services/checkoutSecurity';

import { getOrderRepository } from '@/lib/orders';
import { quoteStandardShipping } from '@/lib/printful/shipping';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request format
    const validated = CheckoutRequestSchema.parse(body);

    const normalized = await validateAndNormalizeCheckoutItems(validated.items);
    const orderId = randomUUID();
    const orderAccessToken = generatePublicAccessToken();

    // Check if demo checkout mode is enabled
    if (process.env.NEXT_PUBLIC_DEMO_CHECKOUT === 'true') {
      // Return demo checkout page instead of real Stripe session
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
      return NextResponse.json({ 
        url: `${baseUrl}/checkout/demo?order_id=${encodeURIComponent(orderId)}&token=${encodeURIComponent(orderAccessToken)}`,
        isDemo: true
      });
    }

    // Create Stripe checkout session (production)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    const items = toStoreOrderItems(normalized);
    const shipping = await quoteStandardShipping(items, validated.shippingAddress);
    const subtotal = items.reduce((sum, item) => sum + Math.round(item.unitPrice * 100) * item.quantity, 0) / 100;
    const repository = getOrderRepository();
    await repository.create({
      id: orderId, publicTokenHash: hashPublicAccessToken(orderAccessToken), status: 'pending_payment',
      customerEmail: validated.shippingAddress.email, shippingAddress: validated.shippingAddress,
      items, subtotal, shipping, tax: 0, total: Math.round((subtotal + shipping) * 100) / 100, currency: 'USD', fulfilled: false,
    });
    const session = await createCheckoutSession({
      items: normalized,
      shippingAddress: validated.shippingAddress,
      baseUrl,
      orderId,
      orderAccessToken,
      shipping,
    });
    await repository.update(orderId, { stripeCheckoutSessionId: session.id });

    return NextResponse.json({ url: session.url, isDemo: false });
  } catch (error) {
    console.error('Checkout session creation failed');
    
    if (error instanceof SyntaxError || error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
