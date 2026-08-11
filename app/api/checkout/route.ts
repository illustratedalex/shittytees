import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { CheckoutRequestSchema } from '@/lib/validation/schemas';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { generatePublicAccessToken } from '@/lib/orders/publicAccess';
import { validateAndNormalizeCheckoutItems } from '@/lib/orders/services/checkoutSecurity';

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
      const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      return NextResponse.json({ 
        url: `${baseUrl}/checkout/demo?order_id=${encodeURIComponent(orderId)}&token=${encodeURIComponent(orderAccessToken)}`,
        isDemo: true
      });
    }

    // Create Stripe checkout session (production)
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const checkoutUrl = await createCheckoutSession({
      items: normalized,
      shippingAddress: validated.shippingAddress,
      baseUrl,
      orderId,
      orderAccessToken,
    });

    return NextResponse.json({ url: checkoutUrl, isDemo: false });
  } catch (error) {
    console.error('Checkout error:', error);
    
    if (error instanceof SyntaxError) {
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
