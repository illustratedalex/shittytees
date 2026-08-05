import { NextRequest, NextResponse } from 'next/server';
import { CheckoutRequestSchema } from '@/lib/validation/schemas';
import { createCheckoutSession } from '@/lib/stripe/checkout';
import { DEMO_PRODUCTS } from '@/lib/data/products';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request format
    const validated = CheckoutRequestSchema.parse(body);

    // Verify all products and variants exist with correct pricing
    for (const item of validated.items) {
      let found = false;
      for (const product of DEMO_PRODUCTS) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (variant && variant.available) {
          found = true;
          // Verify client price doesn't exceed server price
          if (item.unitPrice > variant.retailPrice * 1.01) {
            return NextResponse.json(
              { error: 'Price validation failed' },
              { status: 400 }
            );
          }
          break;
        }
      }
      if (!found) {
        return NextResponse.json(
          { error: `Product or variant not found or unavailable: ${item.variantId}` },
          { status: 404 }
        );
      }
    }

    // Check if demo checkout mode is enabled
    if (process.env.NEXT_PUBLIC_DEMO_CHECKOUT === 'true') {
      // Return demo checkout page instead of real Stripe session
      const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      return NextResponse.json({ 
        url: `${baseUrl}/checkout/demo`,
        isDemo: true
      });
    }

    // Create Stripe checkout session (production)
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const checkoutUrl = await createCheckoutSession({
      items: validated.items,
      shippingAddress: validated.shippingAddress,
      baseUrl,
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
