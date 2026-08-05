import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin/auth';
import { getOrderRepository } from '@/lib/orders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  await requireAdminSession();
  const repository = getOrderRepository();
  const params = await searchParams;

  const result = await repository.list({
    pageSize: 50,
    status: params.status as any,
    search: params.search,
  });

  return (
    <main className="min-h-screen bg-[#0e0d0c] pt-[7rem] sm:pt-[7.5rem] px-5 pb-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-[#f2ecde] text-3xl mb-6">Admin Orders</h1>

        <form className="panel-soft p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input name="search" defaultValue={params.search || ''} placeholder="Search order or email" className="flex-1 min-h-[44px] px-3 bg-[#12110f] border border-[#f2ecde30] rounded text-[#f2ecde]" />
          <select name="status" defaultValue={params.status || ''} className="min-h-[44px] px-3 bg-[#12110f] border border-[#f2ecde30] rounded text-[#f2ecde]">
            <option value="">All statuses</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="paid">Paid</option>
            <option value="printful_draft_created">Printful Draft</option>
            <option value="submitted_to_printful">Submitted</option>
            <option value="in_fulfillment">In Fulfillment</option>
            <option value="shipped">Shipped</option>
            <option value="failed">Failed</option>
            <option value="canceled">Canceled</option>
            <option value="refunded">Refunded</option>
          </select>
          <button type="submit" className="btn-primary">Filter</button>
        </form>

        <div className="panel-soft p-4 overflow-x-auto">
          <table className="w-full text-left text-sm text-[#d4cdbc]">
            <thead>
              <tr className="text-[#f2ecde]">
                <th className="py-2">Order</th>
                <th className="py-2">Status</th>
                <th className="py-2">Email</th>
                <th className="py-2">Total</th>
                <th className="py-2">Printful</th>
                <th className="py-2">Updated</th>
              </tr>
            </thead>
            <tbody>
              {result.orders.map((order) => (
                <tr key={order.id} className="border-t border-[#f2ecde14]">
                  <td className="py-3">
                    <Link href={`/admin/orders/${order.id}`} className="underline">
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="py-3">{order.status}</td>
                  <td className="py-3">{order.customerEmail.replace(/^(.).+(@.+)$/, '$1***$2')}</td>
                  <td className="py-3">{order.currency} {order.total.toFixed(2)}</td>
                  <td className="py-3">{order.printfulOrderId || '—'}</td>
                  <td className="py-3">{new Date(order.updatedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
