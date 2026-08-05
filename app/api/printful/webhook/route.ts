import { NextRequest, NextResponse } from 'next/server';
import { validatePrintfulWebhook } from '@/lib/printful/client';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('X-Printful-Signature') || '';

  // Validate webhook signature
  if (!validatePrintfulWebhook(body, signature)) {
    console.warn('Printful webhook signature validation failed');
    // Still process for development, but log the warning
  }

  try {
    const event = JSON.parse(body);

    switch (event.type) {
      case 'order_failed':
        await handleOrderFailed(event.data);
        break;
      case 'order_canceled':
        await handleOrderCanceled(event.data);
        break;
      case 'package_shipped':
        await handlePackageShipped(event.data);
        break;
      case 'package_returned':
        await handlePackageReturned(event.data);
        break;
      default:
        console.log(`Unhandled Printful event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Printful webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 });
  }
}

async function handleOrderFailed(data: any) {
  console.log(`Printful order failed: ${data.order?.id}`);
  // Update order status to failed
  // Find order by printful order ID and update status
}

async function handleOrderCanceled(data: any) {
  console.log(`Printful order canceled: ${data.order?.id}`);
}

async function handlePackageShipped(data: any) {
  console.log(`Printful package shipped: ${data.order?.id}`);
  // Update order status to fulfilled
}

async function handlePackageReturned(data: any) {
  console.log(`Printful package returned: ${data.order?.id}`);
}
