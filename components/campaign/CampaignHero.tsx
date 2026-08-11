import type { Product } from '@/lib/types/product';
import { BrandPattern } from '@/components/brand';
import HeroCTA from '@/components/common/HeroCTA';
import GarmentMockup from '@/components/product/GarmentMockup';
import { getProductPresentation } from '@/data/productPresentation';

interface CampaignHeroProps {
  eyebrow: string;
  headline: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  campaignLabel?: string;
  theme?: 'dark' | 'light';
  product?: Product;
  mediaAsset?: string;
}

function colorForProduct(product?: Product): 'black' | 'bone' | 'charcoal' | 'white' | 'oxblood' {
  const colorHex = product?.variants[0]?.colorHex?.toLowerCase() || '#000000';
  if (colorHex === '#f5f5dc') return 'bone';
  if (colorHex === '#ffffff') return 'white';
  if (colorHex === '#36454f') return 'charcoal';
  if (colorHex === '#800000') return 'oxblood';
  return 'black';
}

export default function CampaignHero({
  eyebrow,
  headline,
  body,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  campaignLabel,
  theme = 'dark',
  product,
  mediaAsset,
}: CampaignHeroProps) {
  const isDark = theme === 'dark';
  const lines = headline.split('\n');
  const presentation = product ? getProductPresentation(product.slug) : undefined;

  return (
    <section className={`relative min-h-[72vh] sm:min-h-[76vh] lg:min-h-[78vh] pt-[7rem] sm:pt-[7.5rem] lg:pt-24 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f0ebdf]'}`}>
      <div className="absolute inset-0">
        <BrandPattern variant={isDark ? 'light' : 'dark'} className="absolute inset-0 opacity-0 sm:opacity-15" />
        <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(circle_at_76%_24%,#3a342e_0%,#1e1b18_46%,#0a0a0a_100%)]' : 'bg-[radial-gradient(circle_at_72%_14%,#f0ebdf_0%,#d7cfbf_49%,#c4baa8_100%)]'}`}></div>
      </div>

      <div className="relative z-10 max-w-[84rem] mx-auto px-5 sm:px-8 lg:px-10 min-h-[66vh] grid lg:grid-cols-[minmax(0,34rem)_minmax(18rem,1fr)] items-center gap-8 lg:gap-12 pt-24 sm:pt-16 lg:pt-14 pb-10 sm:pb-14 md:pb-16">
        <div className="max-w-[34rem] pt-2 sm:pt-0">
          <p className={`type-kicker mb-4 ${isDark ? 'text-[#b6a98f]' : 'text-[#564c40]'}`}>{eyebrow}</p>
          <h1 className={`type-display-xl mb-5 max-w-[10.8ch] sm:max-w-[12.2ch] ${isDark ? 'text-[#f0ebdf]' : 'text-[#121110]'}`}>
            {lines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                {index < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>
          <p className={`text-base sm:text-[1.02rem] max-w-[34ch] mb-8 ${isDark ? 'text-[#d5cab6]' : 'text-[#302a24]'}`}>{body}</p>
          {campaignLabel ? <p className={`text-[12px] sm:text-[13px] uppercase tracking-[0.12em] mb-7 ${isDark ? 'text-[#aa9e8a]' : 'text-[#4f463d]'}`}>{campaignLabel}</p> : null}
          <HeroCTA
            primaryHref={primaryCtaHref}
            secondaryHref={secondaryCtaHref}
            primaryLabel={primaryCtaLabel}
            secondaryLabel={secondaryCtaLabel}
          />
        </div>

        <div className="relative w-full min-h-[18rem] sm:min-h-[22rem] md:min-h-[26rem] lg:min-h-[32rem] pointer-events-none lg:justify-self-end">
          <GarmentMockup
            color={presentation?.garmentColor || colorForProduct(product)}
            artworkText={presentation?.artworkDisplayText || product?.name || 'Shitty Tees'}
            artworkPlacement={presentation?.artworkPlacement || 'center'}
            artworkImage={mediaAsset}
            background={isDark ? 'bone' : 'bone'}
            scale="hero"
            rotation={1.1}
            className="h-full w-full"
            decorative
          />
        </div>
      </div>
    </section>
  );
}
