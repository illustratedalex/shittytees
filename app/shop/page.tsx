import Link from 'next/link';
import { DEMO_PRODUCTS } from '@/lib/data/products';

export const dynamic = 'force-static';

export default function ShopPage() {
  const products = DEMO_PRODUCTS.filter((p) => p.active);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="mb-12">
          <Link href="/" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-6 inline-flex items-center gap-2">
            ← Back
          </Link>
          <div className="mb-6">
            <h1 className="text-black mb-2">Shop All</h1>
            <div className="w-12 h-1 bg-red-900"></div>
          </div>
          <p className="text-gray-600">All products. All questionable.</p>
        </div>

        <div className="product-grid">
          {products.map((product) => (
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
    </div>
  );
}
