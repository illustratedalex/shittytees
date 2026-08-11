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

function formatLabel(value: string): string {
  return value.replace(/-/g, ' ');
}

export default function ProductDetailClient({ product, relatedProducts }: Props) {
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || '');
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const gallery = useMemo(() => resolveProductGallery(product), [product]);
  const selectedGalleryImage = gallery[selectedImageIndex] || gallery[0];
  const selectedImage = selectedGalleryImage ? toResolvedProductImage(selectedGalleryImage) : resolveProductImage(product);
  const cartImage = resolveCartThumbnail(product);
  const sizes = useMemo(() => Array.from(new Set(product.variants.map((variant) => variant.size))), [product.variants]);
  const colors = useMemo(() => Array.from(new Set(product.variants.map((variant) => variant.color))), [product.variants]);
  const hasColorOptions = colors.length > 1;

  const selectedVariant = useMemo(() => {
    return product.variants.find((variant) => variant.size === selectedSize && variant.color === selectedColor)
      || product.variants.find((variant) => variant.size === selectedSize)
      || product.variants.find((variant) => variant.available)
      || product.variants[0];
  }, [product.variants, selectedColor, selectedSize]);

  const collectionLabel = product.collectionSlug ? formatLabel(product.collectionSlug) : '';

  const onSizeSelect = (nextSize: string) => {
    setSelectedSize(nextSize);

    if (!hasColorOptions) return;

    const exactMatchExists = product.variants.some((variant) => variant.size === nextSize && variant.color === selectedColor);
    if (exactMatchExists) return;

    const nextColor = product.variants.find((variant) => variant.size === nextSize && variant.available)?.color
      || product.variants.find((variant) => variant.size === nextSize)?.color;

    if (nextColor) {
      setSelectedColor(nextColor);
    }
  };

  const onColorSelect = (nextColor: string) => {
    setSelectedColor(nextColor);

    const exactMatchExists = product.variants.some((variant) => variant.size === selectedSize && variant.color === nextColor);
    if (exactMatchExists) return;

    const nextSize = product.variants.find((variant) => variant.color === nextColor && variant.available)?.size
      || product.variants.find((variant) => variant.color === nextColor)?.size;

    if (nextSize) {
      setSelectedSize(nextSize);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    if (!selectedVariant.available) {
      setAddError('This variant is currently unavailable.');
      return;
    }

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
      <main className="min-h-screen bg-[#0b0b0b] pt-[5rem]">
        <div className="site-shell section-shell pdp-shell">
          <Link href="/shop" className="text-[#c9beaa] hover:text-[#f2e8d5] text-sm tracking-[0.04em] font-semibold mb-8 inline-flex items-center gap-2 focus-visible-ring rounded-sm">
            ← Back to Shop
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] gap-8 lg:gap-10 xl:gap-12">
            <div className="pdp-media-column">
              <div className="mb-4 lg:mb-5">
                <ProductImageStage
                  image={selectedImage}
                  aspect="4/5"
                  className="w-full pdp-image-stage"
                  priority
                  sizes="(max-width: 1023px) 92vw, (max-width: 1439px) 52vw, 760px"
                />
              </div>

              <ProductThumbnailRail images={gallery} selectedIndex={selectedImageIndex} onSelect={setSelectedImageIndex} />
            </div>

            <div className="lg:sticky lg:top-24 self-start pdp-info-panel">
              <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#37d5d6]">
                {product.category}
                {collectionLabel ? <span className="text-[#9f9787]"> · {collectionLabel}</span> : null}
              </p>

              <h1 className="text-[#f2e8d5] mt-3 text-[2rem] sm:text-[2.55rem] leading-[0.96] tracking-[0.01em]">{product.name}</h1>

              <p className="text-[#c9beaa] text-[1rem] mt-4 leading-relaxed max-w-[38ch]">{product.shortDescription || product.description}</p>

              <Price amount={selectedVariant?.retailPrice || product.retailPrice} currency={product.currency || 'USD'} className="mt-5 text-[1.7rem] sm:text-[1.95rem] text-[#f2e8d5]" />

              <p className="text-[#b9ad97] text-[0.95rem] mt-5 leading-relaxed max-w-[46ch]">{product.description}</p>

              <div className="mt-8 mb-6">
                <p className="block font-semibold text-[#f2e8d5] mb-3 text-xs uppercase tracking-[0.14em]">Size</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {sizes.map((size) => {
                    const sizeMatchesCurrentColor = product.variants.filter((variant) => variant.size === size)
                      .filter((variant) => !hasColorOptions || variant.color === selectedColor);
                    const sizeExists = sizeMatchesCurrentColor.length > 0;
                    const sizeAvailable = sizeMatchesCurrentColor.some((variant) => variant.available);

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => onSizeSelect(size)}
                        disabled={!sizeExists || !sizeAvailable}
                        className={[
                          'min-h-[48px] px-3 font-semibold text-[0.79rem] rounded-sm border transition-colors focus-visible-ring',
                          selectedSize === size
                            ? 'border-[#f2e8d5] bg-[#f2e8d5] text-[#0b0b0b]'
                            : 'border-[#4d4538] bg-[#101010] text-[#f2e8d5] hover:border-[#ffd75a]',
                          !sizeExists || !sizeAvailable ? 'opacity-40 cursor-not-allowed hover:border-[#4d4538]' : '',
                        ].join(' ')}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {hasColorOptions ? (
                <div className="mb-6">
                  <p className="block font-semibold text-[#f2e8d5] mb-3 text-xs uppercase tracking-[0.14em]">Color</p>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((color) => {
                      const colorMatchesCurrentSize = product.variants.filter((variant) => variant.color === color && variant.size === selectedSize);
                      const colorExists = colorMatchesCurrentSize.length > 0;
                      const colorAvailable = colorMatchesCurrentSize.some((variant) => variant.available);

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => onColorSelect(color)}
                          disabled={!colorExists || !colorAvailable}
                          className={[
                            'min-h-[44px] px-4 rounded-sm border text-xs uppercase tracking-[0.12em] transition-colors focus-visible-ring',
                            selectedColor === color
                              ? 'border-[#f2e8d5] bg-[#f2e8d5] text-[#0b0b0b]'
                              : 'border-[#4d4538] text-[#f2e8d5] hover:border-[#ff4f9a] hover:text-[#ff4f9a]',
                            !colorExists || !colorAvailable ? 'opacity-40 cursor-not-allowed hover:border-[#4d4538] hover:text-[#f2e8d5]' : '',
                          ].join(' ')}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mb-6">
                <label htmlFor="product-quantity" className="block font-semibold text-[#f2e8d5] mb-3 text-xs uppercase tracking-[0.14em]">Quantity</label>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="min-h-[48px] min-w-[48px] px-4 py-2 bg-[#171717] hover:bg-[#262626] font-semibold text-[#f2e8d5] rounded-sm border border-[#4d4538] transition-colors focus-visible-ring"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    id="product-quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1)))}
                    className="min-h-[48px] px-4 py-2 bg-[#101010] border border-[#4d4538] text-center text-[#f2e8d5] rounded-sm w-20"
                    aria-label="Quantity"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                    className="min-h-[48px] min-w-[48px] px-4 py-2 bg-[#171717] hover:bg-[#262626] font-semibold text-[#f2e8d5] rounded-sm border border-[#4d4538] transition-colors focus-visible-ring"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleAddToCart}
                className={`w-full px-8 py-4 mb-3 text-[0.82rem] tracking-[0.14em] ${added ? 'bg-[#2d6d4a] text-white hover:bg-[#286342] border-transparent' : ''}`}
              >
                {added ? 'Added to Cart' : 'ADD TO CART'}
              </Button>

              {addError ? <p className="text-sm text-[#e7b2b2] mb-3">{addError}</p> : null}

              <Button href="/cart" variant="secondary" fullWidth>
                View Cart
              </Button>

              <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs uppercase tracking-[0.12em] text-[#b6aa95]">
                <p className="border border-[#3a342a] rounded-sm px-3 py-2">Printed to order</p>
                <p className="border border-[#3a342a] rounded-sm px-3 py-2">Ships direct</p>
                <p className="border border-[#3a342a] rounded-sm px-3 py-2">No warehouse excess</p>
              </div>

              <div className="mt-9 pt-6 border-t border-[#2f2a22] space-y-3">
                <details className="group border border-[#3a342a] rounded-sm px-4 py-3">
                  <summary className="cursor-pointer text-sm uppercase tracking-[0.14em] text-[#f2e8d5] font-semibold">Description</summary>
                  <p className="text-sm text-[#c9beaa] mt-3 leading-relaxed">{product.description}</p>
                </details>
                <details className="group border border-[#3a342a] rounded-sm px-4 py-3">
                  <summary className="cursor-pointer text-sm uppercase tracking-[0.14em] text-[#f2e8d5] font-semibold">Shipping</summary>
                  <p className="text-sm text-[#c9beaa] mt-3 leading-relaxed">Orders are fulfilled through our print-on-demand partner and ship directly after production.</p>
                </details>
                <details className="group border border-[#3a342a] rounded-sm px-4 py-3">
                  <summary className="cursor-pointer text-sm uppercase tracking-[0.14em] text-[#f2e8d5] font-semibold">Returns</summary>
                  <p className="text-sm text-[#c9beaa] mt-3 leading-relaxed">Returns are accepted according to our published returns policy.</p>
                </details>
                <div className="pt-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#9f9787] mb-2">Collection</p>
                  <Link href="/collections" className="text-sm text-[#f2e8d5] hover:text-[#ffd75a] underline decoration-[#ff4f9a]">
                    {collectionLabel || 'Shop all collections'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-16">
            <p className="text-[0.68rem] uppercase tracking-[0.22em] text-[#37d5d6] mb-2">Keep Going</p>
            <h2 className="text-[#f2e8d5] text-[1.8rem] sm:text-[2.2rem] mb-7">MORE BAD DECISIONS</h2>
            <ProductRail products={relatedProducts} title="Related products" />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
