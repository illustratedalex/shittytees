import Link from 'next/link';
import { getAllCollections, getProductsByCollection } from '@/lib/data/products';

export const dynamic = 'force-static';

export default function CollectionsPage() {
  const collections = getAllCollections();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-6 inline-flex items-center gap-2">
          ← Back
        </Link>
        <div className="mb-12">
          <h1 className="text-black mb-2">Collections</h1>
          <div className="w-12 h-1 bg-red-900"></div>
        </div>

        <div className="space-y-24">
          {collections.map((collection) => {
            const products = getProductsByCollection(collection.slug);
            return (
              <div key={collection.id}>
                <div className="mb-10 pb-8 border-b border-gray-200">
                  <h2 className="text-3xl font-bold text-black mb-2">{collection.name}</h2>
                  <p className="text-gray-600">{collection.description}</p>
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
