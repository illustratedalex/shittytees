import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { getCheckoutSession } from '@/lib/stripe/checkout';
import { getOrderRepository } from '@/lib/orders';
import { toErrorResponse } from '@/lib/orders/http';
import { processStripeEvent, StripeSessionShape } from '@/lib/orders/services/webhooks';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const repository = getOrderRepository();
  const sig = request.headers.get('stripe-signature') || '';
  const body = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'Webhook secret is not configured' }, { status: 503 });
  }

  let event: unknown;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (error) {
    console.error('Stripe webhook signature verification failed');
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    await processStripeEvent(
      repository,
      event as Parameters<typeof processStripeEvent>[1],
      async (sessionId): Promise<StripeSessionShape> => {
        const session = await getCheckoutSession(sessionId);
        return {
          id: session.id,
          payment_status: session.payment_status,
          customer_email: session.customer_email,
          payment_intent: session.payment_intent as string | { id?: string } | null,
          amount_subtotal: session.amount_subtotal,
          amount_total: session.amount_total,
          total_details: session.total_details
            ? {
                amount_shipping: session.total_details.amount_shipping,
                amount_tax: session.total_details.amount_tax,
              }
            : null,
          metadata: session.metadata || undefined,
        };
      },
    );
    return NextResponse.json({ received: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
