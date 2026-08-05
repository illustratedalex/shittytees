import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe/client';
import { orderRepository, fulfillmentTracker } from '@/lib/db/repository';
import { Order } from '@/lib/types/order';
import { getCheckoutSession } from '@/lib/stripe/checkout';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const sig = request.headers.get('stripe-signature') || '';
  const body = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret) {
    console.warn('STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json({ received: true });
  }

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'checkout.session.async_payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}

async function handlePaymentSuccess(session: any) {
  const sessionId = session.id;

  // Check if already fulfilled
  const fulfilled = await fulfillmentTracker.isFulfilled(sessionId);
  if (fulfilled) {
    console.log(`Session ${sessionId} already fulfilled`);
    return;
  }

  try {
    // Retrieve full session with line items
    const fullSession = await getCheckoutSession(sessionId);

    if (fullSession.payment_status !== 'paid') {
      console.log(`Payment not marked as paid for session ${sessionId}`);
      return;
    }

    // Reconstruct order from session metadata
    const metadata = fullSession.metadata || {};
    const cartItems = metadata.cartItems ? JSON.parse(metadata.cartItems) : [];

    // Create order record
    const order: Order = {
      id: randomUUID(),
      stripeCheckoutSessionId: sessionId,
      stripePaymentIntentId: (fullSession.payment_intent as any)?.id,
      status: 'paid',
      customerEmail: fullSession.customer_email || '',
      shippingAddress: {
        firstName: metadata.shippingFirstName || '',
        lastName: metadata.shippingLastName || '',
        email: fullSession.customer_email || '',
        address: metadata.shippingAddress || '',
        city: metadata.shippingCity || '',
        state: metadata.shippingState || '',
        postalCode: metadata.shippingPostalCode || '',
        country: metadata.shippingCountry || 'US',
      },
      items: cartItems,
      subtotal: fullSession.amount_subtotal ? fullSession.amount_subtotal / 100 : 0,
      shipping: fullSession.total_details?.amount_shipping ? fullSession.total_details.amount_shipping / 100 : 0,
      tax: fullSession.total_details?.amount_tax ? fullSession.total_details.amount_tax / 100 : 0,
      total: fullSession.amount_total ? fullSession.amount_total / 100 : 0,
      fulfilled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save order
    await orderRepository.save(order);

    // In development, don't auto-submit to Printful unless explicitly enabled
    if (process.env.PRINTFUL_AUTO_CONFIRM === 'true') {
      // TODO: Submit to Printful
      order.status = 'submitting_to_printful';
      order.updatedAt = new Date();
      await orderRepository.save(order);
    } else {
      order.status = 'submitted';
      order.updatedAt = new Date();
      await orderRepository.save(order);
    }

    // Mark as fulfilled
    await fulfillmentTracker.markFulfilled(sessionId, order.id);

    console.log(`Order created from session ${sessionId}: ${order.id}`);
  } catch (error) {
    console.error(`Failed to process payment success for session ${sessionId}:`, error);
    throw error;
  }
}

async function handlePaymentFailed(session: any) {
  console.log(`Payment failed for session ${session.id}`);
  // Mark session as failed in future database
}

async function handleChargeRefunded(charge: any) {
  console.log(`Charge refunded: ${charge.id}`);
  // Update order status to refunded
}
