'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { CartItem } from '@/lib/types/cart';
import { evaluateVariantFulfillmentReadiness } from '@/lib/fulfillment/readiness';
import { resolveProductGallery, resolveProductImage, toResolvedProductImage } from '@/lib/products/imageResolver';
import { SiteFooter, SiteHeader } from '@/components/layout';
import Button from '@/components/common/Button';
import Price from '@/components/common/Price';
import ProductRail from '@/components/product/ProductRail';
import ProductImageStage from '@/components/product/ProductImageStage';
import ProductThumbnailRail from '@/components/product/ProductThumbnailRail';

export interface ProductViewModel {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  category: string;
  collectionSlug: string;
  retailPrice: number;
  currency?: string;
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

export function resolveCartThumbnail(product: ProductViewModel): string {
  return resolveProductImage(product).src;
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addItem } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const gallery = useMemo(() => resolveProductGallery(product), [product]);
  const selectedGalleryImage = gallery[selectedImageIndex] || gallery[0];
  const selectedImage = selectedGalleryImage ? toResolvedProductImage(selectedGalleryImage) : resolveProductImage(product);
  const cartImage = resolveCartThumbnail(product);

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    const readiness = evaluateVariantFulfillmentReadiness(product.id, selectedVariant.id);
    if (!readiness.ready) {
      setAddError('This product variant is not ready for checkout yet.');
      return;
    }

    setAddError('');

    const cartItem: CartItem = {
      productId: product.id,
      variantId: selectedVariant.id,
      quantity,
      name: product.name,
      image: cartImage,
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
      <main className="min-h-screen bg-[#111111] pt-[4.75rem]">
        <div className="site-shell section-shell">
          <Link href="/shop" className="text-[#d5d0c6] hover:text-[#f3efe6] text-sm tracking-[0.04em] font-semibold mb-8 inline-flex items-center gap-2">
            ← Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1.12fr_0.88fr] gap-8 lg:gap-12">
            <div>
              <div className="mb-5">
                <ProductImageStage
                  image={selectedImage}
                  aspect="4/5"
                  className="w-full"
                  priority
                  sizes="(max-width: 1023px) 92vw, (max-width: 1279px) 54vw, 720px"
                />
              </div>

              <ProductThumbnailRail images={gallery} selectedIndex={selectedImageIndex} onSelect={setSelectedImageIndex} />
            </div>

            <div className="lg:sticky lg:top-24 self-start bg-[#1b1b1b] border border-[#2f2f2f] rounded-2xl p-6 sm:p-7">
              <h1 className="text-[#f3efe6] mb-2 text-[1.9rem] sm:text-[2.3rem] leading-[0.96]">{product.name}</h1>
              <Price amount={selectedVariant?.retailPrice || product.retailPrice} currency={product.currency || 'USD'} className="mb-5 text-[1.6rem] sm:text-[1.8rem] text-[#f3efe6]" />

              <p className="text-[#d5d0c6] text-sm sm:text-base mb-7 leading-relaxed max-w-[44ch]">{product.shortDescription || product.description}</p>

              <Link href="/faq" className="text-sm underline decoration-[#aaa59c] text-[#d5d0c6] hover:text-[#f3efe6] mb-7 inline-block">
                View size guide
              </Link>

              <div className="mb-6">
                <label className="block font-semibold text-[#f3efe6] mb-4 text-sm uppercase tracking-[0.1em]">Select Size & Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      disabled={!variant.available}
                      className={`min-h-[52px] p-3 font-semibold text-xs rounded-md border transition-all focus-visible-ring ${
                        selectedVariant?.id === variant.id
                          ? 'border-[#f3efe6] bg-[#7f1d1d] text-[#f3efe6]'
                          : 'border-[#3a3a3a] bg-[#171717] text-[#f3efe6] hover:border-[#aaa59c]'
                      } ${!variant.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div>{variant.size}</div>
                      <div className="text-xs opacity-75">{variant.color}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-[#f3efe6] mb-4 text-sm uppercase tracking-[0.1em]">Quantity</label>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="min-h-[48px] min-w-[48px] px-4 py-2 bg-[#242424] hover:bg-[#2e2e2e] font-semibold text-[#f3efe6] rounded-md transition-colors focus-visible-ring"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="min-h-[48px] px-4 py-2 bg-[#141414] border border-[#3a3a3a] text-center text-[#f3efe6] rounded-md w-20"
                    aria-label="Quantity"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                    className="min-h-[48px] min-w-[48px] px-4 py-2 bg-[#242424] hover:bg-[#2e2e2e] font-semibold text-[#f3efe6] rounded-md transition-colors focus-visible-ring"
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

              {addError ? <p className="text-sm text-[#e7b2b2] mb-3">{addError}</p> : null}

              <Button href="/cart" variant="secondary" fullWidth>
                View Cart
              </Button>

              <div className="mt-9 pt-6 border-t border-[#2f2f2f] space-y-3">
                <details className="group border border-[#2f2f2f] rounded-md px-4 py-3">
                  <summary className="cursor-pointer text-sm uppercase tracking-[0.14em] text-[#f3efe6] font-semibold">Details</summary>
                  <p className="text-sm text-[#d5d0c6] mt-3">{product.description}</p>
                </details>
                <details className="group border border-[#2f2f2f] rounded-md px-4 py-3">
                  <summary className="cursor-pointer text-sm uppercase tracking-[0.14em] text-[#f3efe6] font-semibold">Shipping</summary>
                  <p className="text-sm text-[#d5d0c6] mt-3">Orders are printed on demand and ship after production.</p>
                </details>
                <details className="group border border-[#2f2f2f] rounded-md px-4 py-3">
                  <summary className="cursor-pointer text-sm uppercase tracking-[0.14em] text-[#f3efe6] font-semibold">Returns</summary>
                  <p className="text-sm text-[#d5d0c6] mt-3">Returns are accepted according to our published returns policy.</p>
                </details>
                <div className="pt-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#aaa59c] mb-2">Collection</p>
                  <Link href="/collections" className="text-sm text-[#d5d0c6] hover:text-[#f3efe6] underline decoration-[#7f1d1d]">
                    {product.collectionSlug.replace(/-/g, ' ')}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-16">
            <h2 className="text-[#f3efe6] text-2xl mb-6">Related Products</h2>
            <ProductRail products={relatedProducts} title="Related products" />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
