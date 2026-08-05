import { NextRequest, NextResponse } from 'next/server';
import { assertAdminPostRequest, requireAdminSession } from '@/lib/admin/auth';
import { getOrderRepository } from '@/lib/orders';
import { toErrorResponse } from '@/lib/orders/http';
import { createDraftForOrder } from '@/lib/orders/services/fulfillment';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdminSession();
    assertAdminPostRequest(request);
    const repository = getOrderRepository();
    const { id } = await context.params;

    const order = await createDraftForOrder(repository, id, 'admin_action');
    return NextResponse.json({ order });
  } catch (error) {
    return toErrorResponse(error);
  }
}
