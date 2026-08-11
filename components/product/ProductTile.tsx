import Link from 'next/link';
import ProductImageStage from './ProductImageStage';
import ProductQuickInfo from './ProductQuickInfo';
import type { MerchProduct } from './types';
import { resolveProductImage } from '@/lib/products/imageResolver';

interface ProductTileProps {
  product: MerchProduct;
  href?: string;
  className?: string;
  useMockup?: boolean;
  badge?: string;
  descriptor?: string;
}

export default function ProductTile({
  product,
  href,
  className,
  useMockup = true,
  badge,
  descriptor,
}: ProductTileProps) {
  const targetHref = href || `/shop/${product.slug}`;
  const resolvedImage = useMockup
    ? resolveProductImage(product)
    : {
        src: product.images[0]?.src || '',
        alt: product.images[0]?.alt || `${product.name} image`,
        source: 'placeholder' as const,
        isPreview: false,
        role: 'unknown' as const,
      };

  return (
    <Link
      href={targetHref}
      className={['product-card-clean group focus-visible-ring flex flex-col', className].filter(Boolean).join(' ')}
      aria-label={`View ${product.name}`}
    >
      <ProductImageStage image={resolvedImage} aspect="4/5" className="product-poster-media" />

      <ProductQuickInfo product={product} descriptor={descriptor} badge={badge} className="mt-5" />
    </Link>
  );
}
