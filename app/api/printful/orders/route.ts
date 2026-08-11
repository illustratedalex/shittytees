import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin/auth';
import { getOrderRepository } from '@/lib/orders';
import { toErrorResponse } from '@/lib/orders/http';
import { createDraftForOrder } from '@/lib/orders/services/fulfillment';

export async function GET() {
  try {
    await requireAdminSession();
    const repository = getOrderRepository();
    const result = await repository.list({ pageSize: 25 });
    return NextResponse.json({ orders: result.orders });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const repository = getOrderRepository();
    const { orderId } = (await request.json()) as { orderId?: string };

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const order = await createDraftForOrder(repository, orderId, 'admin_action');
    return NextResponse.json({ order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
