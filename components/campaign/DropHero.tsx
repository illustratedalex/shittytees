import type { Product } from '@/lib/types/product';
import Button from '@/components/common/Button';
import GarmentMockup from '@/components/product/GarmentMockup';

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
  const headingClass = 'text-[#f0ebdf] text-[2.1rem] sm:text-[3rem] md:text-[4.1rem] leading-[0.9] mb-5';

  return (
    <section className={`py-16 sm:py-20 lg:py-24 ${alternateTheme ? 'bg-[#1c1713]' : 'bg-[#1b1b1b]'}`}>
      <div className="max-w-[96rem] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <p className="section-kicker mb-3">Drop {dropNumber}</p>
            {headingLevel === 'h1' ? <h1 className={headingClass}>{title}</h1> : <h2 className={headingClass}>{title}</h2>}
            <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#aa9e8a] mb-4">{releaseLabel}</p>
            <p className="text-[#d4c8b3] text-sm sm:text-base mb-8 max-w-lg">{description}</p>
            <Button href={ctaHref} variant="primary" className="px-9 py-3.5">{ctaLabel}</Button>
          </div>

          <div className="order-1 lg:order-2 min-h-[20rem] sm:min-h-[26rem] lg:min-h-[33rem]">
            <GarmentMockup
              color={colorForProduct(featuredProduct)}
              artworkText={featuredProduct?.name || title}
              background={alternateTheme ? 'oxblood' : 'charcoal'}
              scale="large"
              rotation={-1.3}
              badge={`Drop ${dropNumber}`}
              interactive
              className="h-full w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
