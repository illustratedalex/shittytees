'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { CartItem } from '@/lib/types/cart';
import { SiteFooter, SiteHeader } from '@/components/layout';
import Button from '@/components/common/Button';
import Price from '@/components/common/Price';
import ProductLabel from '@/components/common/ProductLabel';
import ProductRail from '@/components/product/ProductRail';
import GarmentMockup from '@/components/product/GarmentMockup';

export interface ProductViewModel {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  collectionSlug: string;
  retailPrice: number;
  images: Array<{
    id: string;
    src: string;
    alt: string;
  }>;
  variants: Array<{
    id: string;
    printfulVariantId: string;
    size: string;
    color: string;
    retailPrice: number;
    available: boolean;
  }>;
}

interface Props {
  product: ProductViewModel;
  relatedProducts: ProductViewModel[];
}

function mockupColor(color?: string): 'black' | 'bone' | 'charcoal' | 'white' | 'oxblood' {
  const normalized = (color || '').toLowerCase();
  if (normalized.includes('cream') || normalized.includes('bone')) return 'bone';
  if (normalized.includes('white')) return 'white';
  if (normalized.includes('charcoal') || normalized.includes('gray') || normalized.includes('grey')) return 'charcoal';
  if (normalized.includes('maroon') || normalized.includes('oxblood') || normalized.includes('red')) return 'oxblood';
  return 'black';
}

function uniqueVariantColors(
  variants: ProductViewModel['variants'],
): Array<{ label: string; value: string }> {
  const seen = new Set<string>();
  const colors: Array<{ label: string; value: string }> = [];
  variants.forEach((variant) => {
    const key = variant.color.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      colors.push({ label: variant.color, value: key });
    }
  });
  return colors;
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const colorOptions = useMemo(() => uniqueVariantColors(product.variants), [product.variants]);

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
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#0e0d0c] pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <Link href="/shop" className="text-[#d4cdbc] hover:text-[#f2ecde] text-xs uppercase tracking-[0.16em] font-semibold mb-8 inline-flex items-center gap-2">
            ← Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-10 lg:gap-12">
            <div>
              <div className="min-h-[24rem] sm:min-h-[31rem] sticky top-24 mb-4">
                <GarmentMockup
                  color={mockupColor(selectedVariant?.color)}
                  artworkText={product.name}
                  background="charcoal"
                  scale="hero"
                  className="h-full w-full"
                  interactive
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {product.variants.slice(0, 3).map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`min-h-20 border rounded-[0.5rem] ${selectedVariant?.id === variant.id ? 'border-[#f2ecde] bg-[#1d1916]' : 'border-[#f2ecde1f] bg-[#141311]'} transition-colors`}
                    aria-label={`Select ${variant.size} ${variant.color}`}
                  >
                    <GarmentMockup
                      color={mockupColor(variant.color)}
                      artworkText={product.name}
                      background="black"
                      scale="small"
                      className="h-full w-full"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:sticky lg:top-24 self-start panel-soft p-6 sm:p-7">
              <div className="mb-3">
                <ProductLabel category={product.category} status="core" />
              </div>
              <h1 className="text-[#f2ecde] mb-2">{product.name}</h1>
              <Price amount={selectedVariant?.retailPrice || product.retailPrice} className="mb-6 text-2xl" />

              <p className="text-[#d4cdbc] text-base mb-7 leading-relaxed">{product.description}</p>

              <Link href="/faq" className="text-sm underline decoration-[#8f8779] text-[#c4b9a7] hover:text-[#f2ecde] mb-7 inline-block">
                View size guide
              </Link>

              <div className="mb-7">
                <label className="block font-semibold text-[#f2ecde] mb-4 text-sm uppercase tracking-[0.1em]">Select Size & Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!variant.available}
                      className={`p-3 font-semibold text-xs rounded-md border transition-all ${
                        selectedVariant?.id === variant.id
                          ? 'border-[#f2ecde] bg-[#5b1216] text-[#f2ecde]'
                          : 'border-[#f2ecde3d] bg-[#141311] text-[#f2ecde] hover:border-[#f2ecde]'
                      } ${!variant.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div>{variant.size}</div>
                      <div className="text-xs opacity-75">{variant.color}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  {colorOptions.map((option) => (
                    <span key={option.value} className="badge badge--soft">{option.label}</span>
                  ))}
                </div>
              </div>

              <div className="mb-7">
                <label className="block font-semibold text-[#f2ecde] mb-4 text-sm uppercase tracking-[0.1em]">Quantity</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 bg-[#201d1a] hover:bg-[#292621] font-semibold text-[#f2ecde] rounded-md transition-colors"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="px-4 py-2 bg-[#12110f] border border-[#f2ecde3d] text-center text-[#f2ecde] rounded-md w-20 focus:outline-none"
                    aria-label="Quantity"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                    className="px-4 py-2 bg-[#201d1a] hover:bg-[#292621] font-semibold text-[#f2ecde] rounded-md transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddToCart}
                className={`w-full px-8 py-4 mb-3 ${added ? 'bg-[#2d6d4a] text-white hover:bg-[#286342] border-transparent' : ''}`}
              >
                {added ? 'Added to Cart' : 'Add to Cart'}
              </Button>

              <Button href="/cart" variant="secondary" fullWidth>
                View Cart
              </Button>

              <div className="mt-10 pt-6 border-t border-[#f2ecde22] space-y-3">
                <details className="group border border-[#f2ecde24] rounded-md px-4 py-3">
                  <summary className="cursor-pointer text-sm uppercase tracking-[0.14em] text-[#f2ecde] font-semibold">Product Details</summary>
                  <p className="text-sm text-[#cabda8] mt-3">{product.shortDescription}</p>
                </details>
                <details className="group border border-[#f2ecde24] rounded-md px-4 py-3">
                  <summary className="cursor-pointer text-sm uppercase tracking-[0.14em] text-[#f2ecde] font-semibold">Shipping & Returns</summary>
                  <p className="text-sm text-[#cabda8] mt-3">Orders are printed on demand, then shipped to your door. Visit returns policy for full details.</p>
                </details>
                <div className="pt-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8f8779] mb-2">Collection</p>
                  <Link href="/collections" className="text-sm text-[#d4cdbc] hover:text-[#f2ecde] underline decoration-[#5b1216]">
                    {product.collectionSlug}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-16">
            <h2 className="text-[#f2ecde] text-2xl mb-4">Related Products</h2>
            <ProductRail products={relatedProducts} title="Related products" />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
