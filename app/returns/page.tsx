import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-8 inline-flex items-center gap-2">
          ← Back
        </Link>
        <h1 className="text-black mb-12">Returns & Refunds</h1>

        <div className="space-y-8 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Return Window</h2>
            <p className="leading-relaxed">
              You have 30 days from receipt to request a return. Items must be unworn and unwashed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Process</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Contact us at contact@shittytees.com with your order number</li>
              <li>We&apos;ll provide a return shipping label</li>
              <li>Ship the item back to us</li>
              <li>We&apos;ll process your refund within 7 business days of receiving it</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Shipping Costs</h2>
            <p className="leading-relaxed">
              We cover the cost of return shipping. Original shipping cost is non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Defects</h2>
            <p className="leading-relaxed">
              If you receive a defective item, contact us immediately with photos. We&apos;ll send a replacement or full refund.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Questions?</h2>
            <p className="leading-relaxed">
              Email us at{' '}
              <Link href="/contact" className="text-red-900 hover:text-red-950 font-semibold">
                contact
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
