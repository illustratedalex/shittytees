import type { Product } from '@/lib/types/product';
import Button from '@/components/common/Button';
import GarmentMockup from '@/components/product/GarmentMockup';
import { getProductPresentation } from '@/data/productPresentation';

interface DropHeroProps {
  dropNumber: string;
  title: string;
  releaseLabel: string;
  description: string;
  featuredProduct?: Product;
  ctaHref: string;
  ctaLabel: string;
  alternateTheme?: boolean;
  headingLevel?: 'h1' | 'h2';
}

function colorForProduct(product?: Product): 'black' | 'bone' | 'charcoal' | 'white' | 'oxblood' {
  const colorHex = product?.variants[0]?.colorHex?.toLowerCase() || '#000000';
  if (colorHex === '#f5f5dc') return 'bone';
  if (colorHex === '#ffffff') return 'white';
  if (colorHex === '#36454f') return 'charcoal';
  if (colorHex === '#800000') return 'oxblood';
  return 'black';
}

export default function DropHero({
  dropNumber,
  title,
  releaseLabel,
  description,
  featuredProduct,
  ctaHref,
  ctaLabel,
  alternateTheme = false,
  headingLevel = 'h2',
}: DropHeroProps) {
  const headingClass = 'text-[#f0ebdf] text-[1.9rem] sm:text-[2.5rem] md:text-[3.2rem] leading-[0.94] mb-4';
  const presentation = featuredProduct ? getProductPresentation(featuredProduct.slug) : undefined;

  return (
    <section className={`py-14 sm:py-16 lg:py-18 ${alternateTheme ? 'bg-[#1c1713]' : 'bg-[#161412]'}`}>
      <div className="max-w-[84rem] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-10 items-center">
          <div className="order-2 lg:order-1">
            <p className="section-kicker mb-3">Drop {dropNumber}</p>
            {headingLevel === 'h1' ? <h1 className={headingClass}>{title}</h1> : <h2 className={headingClass}>{title}</h2>}
            <p className="text-[12px] uppercase tracking-[0.12em] text-[#aa9e8a] mb-4">{releaseLabel}</p>
            <p className="text-[#d4c8b3] text-sm sm:text-base mb-7 max-w-[34ch]">{description}</p>
            <Button href={ctaHref} variant="primary" className="px-8 py-4">{ctaLabel}</Button>
          </div>

          <div className="order-1 lg:order-2 min-h-[18rem] sm:min-h-[22rem] lg:min-h-[28rem]">
            <GarmentMockup
              color={presentation?.garmentColor || colorForProduct(featuredProduct)}
              artworkText={presentation?.artworkDisplayText || featuredProduct?.name || title}
              artworkPlacement={presentation?.artworkPlacement || 'center'}
              artworkImage={presentation?.frontImage}
              background={alternateTheme ? 'bone' : 'bone'}
              scale="large"
              rotation={-1.1}
              interactive
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
