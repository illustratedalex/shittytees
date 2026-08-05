import Link from 'next/link';
import { requireAdminSession } from '@/lib/admin/auth';
import { getOrderRepository } from '@/lib/orders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();
  const repository = getOrderRepository();
  const { id } = await params;

  const order = await repository.getById(id);
  if (!order) {
    return (
      <main className="min-h-screen bg-[#0e0d0c] pt-[7rem] px-5">
        <div className="max-w-4xl mx-auto panel-soft p-8">
          <h1 className="text-[#f2ecde] text-2xl">Order not found</h1>
          <Link href="/admin/orders" className="text-[#f2ecde] underline">Back</Link>
        </div>
      </main>
    );
  }

  const canCreateDraft = order.status === 'paid' && !order.printfulOrderId;
  const canSubmit = (order.status === 'printful_draft_created' || order.status === 'paid') && Boolean(order.printfulOrderId);

  return (
    <main className="min-h-screen bg-[#0e0d0c] pt-[7rem] px-5 pb-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="panel-soft p-6">
          <h1 className="text-[#f2ecde] text-2xl mb-2">Order {order.id}</h1>
          <p className="text-[#c4b9a7]">Status: {order.status}</p>
          <p className="text-[#c4b9a7]">Customer: {order.customerEmail}</p>
          <p className="text-[#c4b9a7]">Stripe Session: {order.stripeCheckoutSessionId || '—'}</p>
          <p className="text-[#c4b9a7]">Stripe Payment Intent: {order.stripePaymentIntentId || '—'}</p>
          <p className="text-[#c4b9a7]">Printful Order: {order.printfulOrderId || '—'}</p>
          <p className="text-[#c4b9a7]">Tracking: {order.trackingNumber || '—'}</p>
          <p className="text-[#c4b9a7]">Fulfillment ready: {order.status === 'paid' ? 'Yes' : 'No'}</p>
          {order.mappingError ? <p className="text-red-300">Mapping error: {order.mappingError}</p> : null}
        </div>

        <div className="panel-soft p-6">
          <h2 className="text-[#f2ecde] text-xl mb-3">Shipping Address</h2>
          <p className="text-[#c4b9a7]">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
          <p className="text-[#c4b9a7]">{order.shippingAddress.address}</p>
          {order.shippingAddress.addressLine2 ? <p className="text-[#c4b9a7]">{order.shippingAddress.addressLine2}</p> : null}
          <p className="text-[#c4b9a7]">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
          <p className="text-[#c4b9a7]">{order.shippingAddress.country}</p>
        </div>

        <div className="panel-soft p-6">
          <h2 className="text-[#f2ecde] text-xl mb-3">Items</h2>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="text-[#c4b9a7]">
                {item.quantity}x {item.name} ({item.size}/{item.color})
              </li>
            ))}
          </ul>
        </div>

        <div className="panel-soft p-6">
          <h2 className="text-[#f2ecde] text-xl mb-3">Actions</h2>
          <div className="flex gap-3 flex-wrap">
            {canCreateDraft ? (
              <form action={`/api/admin/orders/${order.id}/create-printful-draft`} method="post">
                <button type="submit" className="btn-primary">Create Printful Draft</button>
              </form>
            ) : null}
            {canSubmit ? (
              <form action={`/api/admin/orders/${order.id}/submit-fulfillment`} method="post">
                <button type="submit" className="btn-secondary">Submit Fulfillment</button>
              </form>
            ) : null}
            <Link href="/admin/orders" className="btn-secondary">Back to Orders</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
