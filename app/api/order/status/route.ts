import { NextRequest, NextResponse } from 'next/server';
import { getOrderRepository } from '@/lib/orders';
import { takeRateLimitToken } from '@/lib/security/rateLimit';

function statusLabel(status: string): string {
  switch (status) {
    case 'pending_payment':
      return 'order received';
    case 'paid':
      return 'payment confirmed';
    case 'printful_draft_created':
      return 'preparing for production';
    case 'submitted_to_printful':
      return 'in production';
    case 'in_fulfillment':
      return 'in production';
    case 'shipped':
      return 'shipped';
    default:
      return 'issue requiring contact';
  }
}

export async function POST(request: NextRequest) {
  const repository = getOrderRepository();
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local';
  const allowed = takeRateLimitToken(`order-status:${ip}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  }

  const payload = (await request.json()) as { id?: string; token?: string };
  if (!payload.id || !payload.token) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  }

  const order = await repository.getByPublicToken(payload.token);
  if (!order || order.id !== payload.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  }

  return NextResponse.json(
    {
      id: order.id,
      status: order.status,
      statusLabel: statusLabel(order.status),
      trackingUrl: order.trackingUrl,
      trackingNumber: order.trackingNumber,
      items: order.items.map((item) => ({
        name: item.name,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      })),
      total: order.total,
      currency: order.currency,
      updatedAt: order.updatedAt.toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    },
  );
}
