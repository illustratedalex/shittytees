import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-8 inline-flex items-center gap-2">
          ← Back
        </Link>
        <h1 className="text-black mb-12">Privacy Policy</h1>

        <div className="space-y-8 text-gray-700">
          <p className="text-sm text-gray-500">Last updated: January 2024</p>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Overview</h2>
            <p className="leading-relaxed">
              We collect information about you when you place an order or contact us. This is your personal data.
              We don&apos;t sell it. We use it to process orders and communicate with you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">What We Collect</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Name and email</li>
              <li>Shipping address</li>
              <li>Order history</li>
              <li>Usage data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Third Parties</h2>
            <p className="leading-relaxed">We share shipping and order information with Printful to fulfill your order. No other sharing without your permission.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Your Rights</h2>
            <p className="leading-relaxed">You can request access to, update, or delete your data. Contact us at contact@shittytees.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
