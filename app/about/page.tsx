import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-8 inline-flex items-center gap-2">
          ← Back
        </Link>
        <h1 className="text-black mb-12">About ShittyTees</h1>

        <div className="space-y-12 text-gray-700">
          <section>
            <h2 className="text-2xl font-bold text-black mb-4">The Concept</h2>
            <p className="leading-relaxed">
              ShittyTees exists because the world has too many generic shirt brands and not enough with genuine personality.
              We started with a simple idea: print designs that make people laugh, think, or both.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Print on Demand</h2>
            <p className="leading-relaxed">
              We partner with Printful to print and ship directly to you. No warehouse. No minimum orders. No
              disappointing inventory rotting in our garage.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Sustainability</h2>
            <p className="leading-relaxed">
              Print-on-demand means we only make what&apos;s ordered. Less waste. Lower emissions. We&apos;re not
              claiming to save the planet, but we&apos;re trying not to destroy it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-black mb-4">Built by DeadSignal</h2>
            <p className="leading-relaxed">
              ShittyTees is part of the DeadSignal platform. We handle the design, you handle looking good in it.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
