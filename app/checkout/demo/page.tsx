import Link from 'next/link';

export default function DemoCheckoutPage() {
  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Warning Banner */}
        <div className="bg-red-50 border border-red-300 p-6 mb-8 text-center rounded-lg">
          <p className="text-lg font-semibold text-red-900">
            ⚠️ Store Preparing to Launch
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-gray-50 border border-gray-200 p-8 mb-8 rounded-lg">
          <h1 className="text-4xl font-bold text-black mb-6">
            Thanks for your interest!
          </h1>

          <div className="space-y-4 text-lg leading-relaxed mb-8 text-gray-700">
            <p>
              Welcome to ShittyTees. We&apos;re putting the finishing touches on our store.
            </p>

            <p className="font-semibold text-red-900">
              🛑 Live ordering is not available yet.
            </p>

            <p>
              We&apos;re finalizing our payment processing and fulfillment systems.
              Your cart is ready, but we&apos;re not accepting orders at this moment.
            </p>

            <p className="text-sm text-gray-600">
              No charge will be made. This page confirms your cart was successfully validated.
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-white border border-gray-300 p-6 mb-8 rounded-lg">
            <h2 className="text-xl font-bold text-black mb-4">What&apos;s Ready</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Your cart is saved and ready</li>
              <li>✓ All prices have been verified server-side</li>
              <li>✓ No payment information was collected</li>
              <li>⏳ Check back soon for live ordering</li>
            </ul>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col gap-4">
            <Link
              href="/shop"
              className="btn-primary"
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="btn-secondary"
            >
              Return to Homepage
            </Link>
          </div>
        </div>

        {/* Technical Note */}
        <div className="text-xs text-gray-500 text-center p-4 border-t border-gray-200">
          <p>
            Demo Mode Active | Stripe Checkout Disabled | No Printful Integration
          </p>
        </div>
      </div>
    </div>
  );
}
