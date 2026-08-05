import { NextRequest, NextResponse } from 'next/server';
import { validatePrintfulWebhook } from '@/lib/printful/client';
import { getOrderRepository } from '@/lib/orders';
import { toErrorResponse } from '@/lib/orders/http';
import { processPrintfulEvent } from '@/lib/orders/services/webhooks';

export async function POST(request: NextRequest) {
  const repository = getOrderRepository();
  const body = await request.text();
  const signature = request.headers.get('X-Printful-Signature') || '';

  if (!validatePrintfulWebhook(body, signature)) {
    console.warn('Printful webhook signature validation failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    const event = JSON.parse(body) as Parameters<typeof processPrintfulEvent>[1];
    await processPrintfulEvent(repository, {
      ...event,
      id: event.id || request.headers.get('X-Printful-Event-Id') || undefined,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
