import { NextRequest, NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/admin/auth';
import { getOrderRepository } from '@/lib/orders';
import { toErrorResponse } from '@/lib/orders/http';

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const repository = getOrderRepository();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = Number(searchParams.get('page') || '1');
    const pageSize = Number(searchParams.get('pageSize') || '25');

    const result = await repository.list({
      page,
      pageSize,
      status: status as any,
      search,
    });

    return NextResponse.json({
      ...result,
      orders: result.orders.map((order) => ({
        id: order.id,
        status: order.status,
        customerEmail: order.customerEmail.replace(/^(.).+(@.+)$/, '$1***$2'),
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        currency: order.currency,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        stripeCheckoutSessionId: order.stripeCheckoutSessionId,
        printfulOrderId: order.printfulOrderId,
        fulfilled: order.fulfilled,
      })),
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
