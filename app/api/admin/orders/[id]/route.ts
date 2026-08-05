import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin/auth';
import { getOrderRepository } from '@/lib/orders';
import { toErrorResponse } from '@/lib/orders/http';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    const repository = getOrderRepository();
    const { id } = await context.params;

    const order = await repository.getById(id);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
