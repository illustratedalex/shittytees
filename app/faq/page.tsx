import Link from 'next/link';

export default function FAQPage() {
  const faqs = [
    { q: 'How long does shipping take?', a: 'Most orders ship within 5-7 business days via Printful.' },
    { q: 'What if my shirt arrives damaged?', a: 'Contact us at contact@shittytees.com with photos and we\'ll send a replacement.' },
    { q: 'Do you ship internationally?', a: 'Not yet. Domestic US only for now.' },
    { q: 'Can I return something?', a: 'See our returns policy for details.' },
    { q: 'What\'s your production quality?', a: 'High-quality screenprints and DTG transfers. We stand behind every shirt.' },
    { q: 'Can I request a custom design?', a: 'Not right now, but we\'re working on it.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-8 inline-flex items-center gap-2">
          ← Back
        </Link>
        <h1 className="text-black mb-12">FAQ</h1>

        <div className="space-y-8">
          {faqs.map((item, i) => (
            <div key={i} className="border-b border-gray-200 pb-8">
              <h2 className="text-lg font-semibold text-black mb-3">{item.q}</h2>
              <p className="text-gray-600 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="font-semibold text-black mb-2">Can&apos;t find what you&apos;re looking for?</h3>
          <p className="text-gray-600 mb-4">Reach out and we&apos;ll get back to you.</p>
          <Link href="/contact" className="text-red-900 hover:text-red-950 font-semibold">
            Contact us →
          </Link>
        </div>
      </div>
    </div>
  );
}
