import Link from 'next/link';

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="text-center py-20">
          <h1 className="text-4xl font-bold text-black mb-4">Order Canceled</h1>
          <p className="text-gray-600 mb-8 text-lg">Your order was not processed. Your items are still in your cart.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cart"
              className="btn-primary"
            >
              Back to Cart
            </Link>
            <Link
              href="/shop"
              className="btn-secondary"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
