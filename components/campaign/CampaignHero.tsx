import type { Product } from '@/lib/types/product';
import { BrandPattern } from '@/components/brand';
import HeroCTA from '@/components/common/HeroCTA';
import GarmentMockup from '@/components/product/GarmentMockup';

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

  return (
    <section className={`relative min-h-[82vh] sm:min-h-[84vh] lg:min-h-[86vh] pt-20 sm:pt-24 ${isDark ? 'bg-[#0a0a0a]' : 'bg-[#f0ebdf]'}`}>
      <div className="absolute inset-0">
        <BrandPattern variant={isDark ? 'light' : 'dark'} className="absolute inset-0 opacity-60" />
        <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(circle_at_72%_14%,#262523_0%,#141414_49%,#0a0a0a_100%)]' : 'bg-[radial-gradient(circle_at_72%_14%,#f0ebdf_0%,#d7cfbf_49%,#c4baa8_100%)]'}`}></div>
      </div>

      <div className="relative z-10 max-w-[96rem] mx-auto px-5 sm:px-8 lg:px-12 min-h-[74vh] flex items-start lg:items-end pt-14 sm:pt-16 lg:pt-0 pb-14 sm:pb-16 md:pb-20">
        <div className="max-w-[30rem] sm:max-w-[31rem] md:max-w-[32rem] lg:max-w-[37rem]">
          <p className={`type-kicker mb-4 ${isDark ? 'text-[#b6a98f]' : 'text-[#564c40]'}`}>{eyebrow}</p>
          <h1 className={`type-display-xl mb-7 max-w-[11.6ch] ${isDark ? 'text-[#f0ebdf]' : 'text-[#121110]'}`}>
            {lines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                {index < lines.length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>
          <p className={`text-sm sm:text-base max-w-lg mb-9 ${isDark ? 'text-[#d5cab6]' : 'text-[#302a24]'}`}>{body}</p>
          {campaignLabel ? <p className={`text-[10px] sm:text-[11px] uppercase tracking-[0.2em] mb-7 ${isDark ? 'text-[#aa9e8a]' : 'text-[#4f463d]'}`}>{campaignLabel}</p> : null}
          <HeroCTA
            primaryHref={primaryCtaHref}
            secondaryHref={secondaryCtaHref}
            primaryLabel={primaryCtaLabel}
            secondaryLabel={secondaryCtaLabel}
          />
        </div>
      </div>

      <div className="absolute right-[2%] sm:right-[3%] md:right-[5%] lg:right-[7%] bottom-[5%] sm:bottom-[6%] w-[70%] sm:w-[52%] md:w-[47%] lg:w-[44%] xl:w-[40%] max-w-[42rem] min-h-[16rem] sm:min-h-[20rem] md:min-h-[24rem] lg:min-h-[31rem] pointer-events-none">
        <GarmentMockup
          color={colorForProduct(product)}
          artworkText={product?.name || 'Shitty Tees'}
          artworkImage={mediaAsset}
          background={isDark ? 'charcoal' : 'bone'}
          scale="hero"
          rotation={1.2}
          className="h-full w-full"
          decorative
        />
      </div>
    </section>
  );
}
