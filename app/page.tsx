import Link from 'next/link';
import { getFeaturedProducts, getAllCollections } from '@/lib/data/products';
import { Product, Collection } from '@/lib/types/product';

export default function Home() {
  const featured = getFeaturedProducts().slice(0, 4);
  const collections = getAllCollections();

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-white border-b border-gray-200 text-center py-3 text-xs uppercase tracking-wider font-medium text-gray-700">
        Printed on demand. Shipped straight to your door.
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            <Link href="/" className="hover:text-red-900 transition-colors">
              ShittyTees
            </Link>
          </h1>
          <nav className="hidden md:flex gap-8 font-medium text-sm text-gray-700">
            <Link href="/shop" className="hover:text-red-900 transition-colors">
              Shop
            </Link>
            <Link href="/collections" className="hover:text-red-900 transition-colors">
              Collections
            </Link>
            <Link href="/about" className="hover:text-red-900 transition-colors">
              About
            </Link>
            <Link href="/faq" className="hover:text-red-900 transition-colors">
              FAQ
            </Link>
          </nav>
          <Link
            href="/cart"
            className="text-sm font-semibold text-gray-700 hover:text-red-900 transition-colors"
          >
            Cart
          </Link>
        </div>
      </header>

      <main className="min-h-screen bg-white">
        {/* Hero Section - Split Design */}
        <section className="py-12 sm:py-14 lg:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-gray-500 mb-3">
                Independent apparel for questionable people
              </p>
              <h1 className="mb-5 text-black">
                Terrible Ideas. Excellent Shirts.
              </h1>
              <p className="text-base text-gray-600 mb-7 leading-relaxed max-w-lg">
                Original apparel with dark humor, tattoo-shop attitude, and zero interest in behaving.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/shop"
                  className="btn-primary"
                >
                  Shop New Releases
                </Link>
                <Link
                  href="/collections"
                  className="btn-secondary"
                >
                  Browse Collections
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-sm">
                <div className="bg-gray-100 aspect-square rounded-none overflow-hidden">
                  <img
                    src={featured[0]?.images[0]?.src || 'https://via.placeholder.com/500'}
                    alt="Featured shirt"
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Subtle tattoo ornament behind */}
                <div className="absolute -inset-4 pointer-events-none text-red-900/20 text-4xl font-thin opacity-50">
                  ◆
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* New Releases */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h2 className="text-black mb-2">New Releases</h2>
              <div className="w-12 h-1 bg-red-900"></div>
            </div>
            <div className="product-grid">
              {featured.map((product: Product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="product-card"
                >
                  <div className="product-image">
                    <img
                      src={product.images[0].src}
                      alt={product.images[0].alt}
                    />
                  </div>
                  <h3 className="text-black mb-2 text-base">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-red-900">${product.retailPrice}</p>
                    <span className="text-xs text-gray-500">{product.variants?.length || 1} colors</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Brand Statement */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 border-y border-gray-200">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-2xl sm:text-3xl font-bold text-black leading-relaxed">
              Made for tattoo shops, garages, dive bars, night shifts, bad decisions, and people who laugh at the wrong time.
            </p>
          </div>
        </section>

        {/* Collections */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="mb-10">
              <h2 className="text-black mb-2">Collections</h2>
              <div className="w-12 h-1 bg-red-900"></div>
            </div>
            <div className="collection-grid">
              {collections.map((collection: Collection) => (
                <Link
                  key={collection.id}
                  href={`/collections/${collection.slug}`}
                  className="product-card"
                >
                  <div className="bg-gray-100 aspect-square mb-4 flex items-center justify-center overflow-hidden rounded-none border border-gray-300 hover:border-red-900 transition-colors">
                    <div className="text-center px-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {collection.name}
                      </h3>
                      <p className="text-xs text-gray-500">{collection.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 border-y border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-black mb-2">How It Works</h2>
              <div className="w-12 h-1 bg-red-900 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { step: '01', title: 'Pick a Shirt', desc: 'Choose your design and size.' },
                { step: '02', title: 'We Print It', desc: 'High-quality print with attention to detail.' },
                { step: '03', title: 'It Ships', desc: 'Direct to your door, fast and secure.' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="text-4xl font-bold text-red-900 mb-4">{item.step}</div>
                  <h3 className="font-semibold text-black mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Email Signup */}
        <section className="py-12 md:py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-black mb-2">Join the Bad Influence</h2>
              <p className="text-sm text-gray-600">New drops, limited runs, and occasional terrible decisions.</p>
            </div>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="your@email.com"
                className="px-4 py-3 bg-white border border-gray-300 text-black placeholder-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
              />
              <button
                type="submit"
                className="btn-primary-oxblood"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-semibold uppercase tracking-wider text-xs mb-4">Shop</h3>
              <nav className="flex flex-col gap-3 text-sm text-gray-400">
                <Link href="/shop" className="hover:text-white transition-colors">
                  All Products
                </Link>
                <Link href="/collections" className="hover:text-white transition-colors">
                  Collections
                </Link>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold uppercase tracking-wider text-xs mb-4">Support</h3>
              <nav className="flex flex-col gap-3 text-sm text-gray-400">
                <Link href="/faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact
                </Link>
                <Link href="/returns" className="hover:text-white transition-colors">
                  Returns
                </Link>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold uppercase tracking-wider text-xs mb-4">Legal</h3>
              <nav className="flex flex-col gap-3 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
              </nav>
            </div>
            <div>
              <h3 className="font-semibold uppercase tracking-wider text-xs mb-4">Other</h3>
              <nav className="flex flex-col gap-3 text-sm text-gray-400">
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </nav>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p className="mb-2">&copy; 2024 ShittyTees. All rights reserved.</p>
            <p>Built & Managed by DeadSignal</p>
          </div>
        </div>
      </footer>
    </>
  );
}
