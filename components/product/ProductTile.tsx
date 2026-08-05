import Link from 'next/link';
import GarmentMockup from './GarmentMockup';
import ProductQuickInfo from './ProductQuickInfo';
import type { MerchProduct } from './types';

interface ProductTileProps {
  product: MerchProduct;
  href?: string;
  className?: string;
  useMockup?: boolean;
  badge?: string;
  descriptor?: string;
}

function garmentColor(product: MerchProduct): 'black' | 'bone' | 'charcoal' | 'white' | 'oxblood' {
  const colorHex = product.variants[0]?.colorHex?.toLowerCase();
  const colorName = product.variants[0]?.color?.toLowerCase();
  if (colorHex === '#f5f5dc') return 'bone';
  if (colorHex === '#ffffff') return 'white';
  if (colorHex === '#36454f') return 'charcoal';
  if (colorHex === '#800000') return 'oxblood';
  if (colorName?.includes('bone') || colorName?.includes('cream')) return 'bone';
  if (colorName?.includes('white')) return 'white';
  if (colorName?.includes('charcoal') || colorName?.includes('gray') || colorName?.includes('grey')) return 'charcoal';
  if (colorName?.includes('maroon') || colorName?.includes('oxblood') || colorName?.includes('red')) return 'oxblood';
  return 'black';
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

  return (
    <Link
      href={targetHref}
      className={['premium-product-card group focus-visible:outline-none', className].filter(Boolean).join(' ')}
      aria-label={`View ${product.name}`}
    >
      <div className="premium-product-media">
        {useMockup ? (
          <GarmentMockup
            color={garmentColor(product)}
            artworkText={product.name}
            artworkPlacement="center"
            background="charcoal"
            scale="medium"
            badge={badge}
            interactive
            className="h-full w-full"
          />
        ) : (
          <img src={product.images[0].src} alt={product.images[0].alt} className="premium-product-artwork" />
        )}
      </div>

      {descriptor ? <p className="premium-product-label mb-2">{descriptor}</p> : null}
      <ProductQuickInfo product={product} />
    </Link>
  );
}
