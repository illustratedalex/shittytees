import { NextRequest, NextResponse } from 'next/server';
import { validatePrintfulWebhookToken } from '@/lib/printful/webhookAuth';
import { getOrderRepository } from '@/lib/orders';
import { toErrorResponse } from '@/lib/orders/http';
import { processPrintfulEvent } from '@/lib/orders/services/webhooks';

export async function POST(request: NextRequest) {
  const body = await request.text();
  if (!validatePrintfulWebhookToken(request.nextUrl.searchParams.get('token') || '')) {
    return NextResponse.json({ error: 'Invalid callback credential' }, { status: 401 });
  }

  try {
    const event = JSON.parse(body) as Parameters<typeof processPrintfulEvent>[1];
    if(event.store!==18894982) return NextResponse.json({error:'Incorrect store'},{status:400});
    const repository = getOrderRepository();
    await processPrintfulEvent(repository, {
      ...event,
      id: event.id || request.headers.get('X-Printful-Event-Id') || undefined,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    return toErrorResponse(error);
  }
}
