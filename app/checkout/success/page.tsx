import Link from 'next/link';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string; order_id?: string; token?: string };
}) {
  const orderHref =
    searchParams.order_id && searchParams.token
      ? `/order/${encodeURIComponent(searchParams.order_id)}?token=${encodeURIComponent(searchParams.token)}`
      : null;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center py-20">
          <div className="text-6xl mb-6">✓</div>
          <h1 className="text-4xl font-bold text-black mb-4">Thanks, Your Payment Was Received</h1>
          <p className="text-gray-600 mb-8 text-lg">
            We are confirming your order now. Status updates may take a moment while webhooks finish processing.
          </p>
          <div className="flex items-center justify-center gap-3">
            {orderHref ? (
              <Link href={orderHref} className="btn-primary">
                View Order Status
              </Link>
            ) : null}
            <Link href="/shop" className="btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
