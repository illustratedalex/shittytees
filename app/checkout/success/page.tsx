import Link from 'next/link';

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; order_id?: string; token?: string }>;
}) {
  const params = await searchParams;
  const orderHref =
    params.order_id && params.token
      ? `/order/${encodeURIComponent(params.order_id)}?token=${encodeURIComponent(params.token)}`
      : null;

  return (
    <div className="checkout-result">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center py-20">
          <div className="text-6xl mb-6">✓</div>
          <h1 className="text-4xl font-bold text-black mb-4">Thanks, Your Payment Was Received</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Your payment was received. View your order for the latest status.
          </p>
          <div className="flex items-center justify-center gap-3">
            {orderHref ? (
              <Link href={orderHref} className="store-button">
                View Order Status
              </Link>
            ) : null}
            <Link href="/shop" className="store-text-link">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
