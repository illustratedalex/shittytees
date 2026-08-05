import Link from 'next/link';

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center py-20">
          <div className="text-6xl mb-6">✓</div>
          <h1 className="text-4xl font-bold text-black mb-4">Order Confirmed</h1>
          <p className="text-gray-600 mb-8 text-lg">
            Thanks for your order. You'll receive a confirmation email shortly with tracking information.
          </p>
          {searchParams.session_id && (
            <p className="text-xs text-gray-500 mb-8">Session ID: {searchParams.session_id}</p>
          )}
          <Link
            href="/shop"
            className="btn-primary"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
