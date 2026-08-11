import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-8 inline-flex items-center gap-2">
          ← Back
        </Link>
        <h1 className="text-black mb-12">Terms of Service</h1>

        <div className="space-y-8 text-gray-700">
          <p className="text-sm text-gray-500">Last updated: January 2024</p>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Acceptance</h2>
            <p className="leading-relaxed">By using ShittyTees, you agree to these terms. If you don&apos;t agree, don&apos;t shop here.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Product Information</h2>
            <p className="leading-relaxed">We do our best to describe products accurately. Images are for reference. Actual products may vary slightly due to screen printing variations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Pricing & Availability</h2>
            <p className="leading-relaxed">
              We reserve the right to update prices and availability. Orders are subject to acceptance and verification.
              We reserve the right to refuse or cancel any order.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the extent permitted by law, ShittyTees and its owners/operators are not liable for indirect, incidental,
              or consequential damages arising from your use of this site or products.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Disputes</h2>
            <p className="leading-relaxed">Any disputes arise under the laws of your jurisdiction. Contact us before pursuing legal action.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
