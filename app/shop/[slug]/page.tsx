'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getProductBySlug } from '@/lib/data/products';
import { useCart } from '@/lib/hooks/useCart';
import { CartItem } from '@/lib/types/cart';

interface Props {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: Props) {
  const product = getProductBySlug(params.slug);
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product?.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-red-900 hover:text-red-950 font-semibold">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const cartItem: CartItem = {
      productId: product.id,
      variantId: selectedVariant.id,
      quantity,
      name: product.name,
      image: product.images[0].src,
      size: selectedVariant.size,
      color: selectedVariant.color,
      unitPrice: selectedVariant.retailPrice,
      printfulVariantId: selectedVariant.printfulVariantId,
    };

    addItem(cartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <Link href="/shop" className="text-red-900 hover:text-red-950 text-sm font-semibold mb-8 inline-flex items-center gap-2">
          ← Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image */}
          <div>
            <div className="product-image sticky top-24">
              <img
                src={product.images[0].src}
                alt={product.images[0].alt}
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <h1 className="text-black mb-4">{product.name}</h1>
            <p className="text-2xl font-bold text-red-900 mb-8">${selectedVariant?.retailPrice}</p>

            <p className="text-gray-600 text-lg mb-8 leading-relaxed">{product.description}</p>

            {/* Variant Selector */}
            <div className="mb-8">
              <label className="block font-semibold text-black mb-4 text-sm">Select Size & Color</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    disabled={!variant.available}
                    className={`p-3 font-semibold text-xs rounded-md border transition-all ${
                      selectedVariant?.id === variant.id
                        ? 'border-red-900 bg-red-900 text-white'
                        : 'border-gray-300 bg-white text-black hover:border-red-900'
                    } ${!variant.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div>{variant.size}</div>
                    <div className="text-xs opacity-75">{variant.color}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block font-semibold text-black mb-4 text-sm">Quantity</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-semibold text-black rounded-md transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="px-4 py-2 bg-white border border-gray-300 text-center text-black rounded-md w-20 focus:outline-none focus:ring-2 focus:ring-red-900"
                />
                <button
                  onClick={() => setQuantity(Math.min(100, quantity + 1))}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 font-semibold text-black rounded-md transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full px-8 py-4 font-semibold rounded-md text-sm transition-all mb-3 ${
                added
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-red-900 text-white hover:bg-red-950'
              }`}
            >
              {added ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            <Link
              href="/cart"
              className="block text-center px-8 py-3 bg-white text-black border border-black font-semibold hover:bg-gray-100 transition-colors rounded-md text-sm"
            >
              View Cart
            </Link>

            {/* Details */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="mb-6">
                <h3 className="font-semibold text-black mb-2 text-sm">About This Design</h3>
                <p className="text-sm text-gray-600">{product.shortDescription}</p>
              </div>
              <div className="mb-6">
                <h3 className="font-semibold text-black mb-2 text-sm">Collection</h3>
                <Link
                  href={`/collections/${product.collectionSlug}`}
                  className="text-red-900 hover:text-red-950 text-sm font-semibold"
                >
                  {product.collectionSlug}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
