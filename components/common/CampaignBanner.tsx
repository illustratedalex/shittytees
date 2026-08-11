import Link from 'next/link';
import type { ReactNode } from 'react';
import GarmentMockup from '@/components/product/GarmentMockup';

type CampaignCollectionKey =
  | 'dark-humor'
  | 'tattoo-culture'
  | 'blue-collar'
  | 'limited-runs'
  | 'holiday-damage'
  | string;

interface CampaignBannerProps {
  collection: CampaignCollectionKey;
  title: string;
  description: ReactNode;
  href?: string;
  eyebrow?: string;
  theme?: 'black' | 'bone' | 'charcoal' | 'oxblood';
  className?: string;
}

export default function CampaignBanner({
  collection,
  title,
  description,
  href = '/collections',
  eyebrow = 'Campaign Lane',
  theme,
  className,
}: CampaignBannerProps) {
  const displayColor = collection === 'tattoo-culture'
    ? 'bone'
    : collection === 'blue-collar'
      ? 'charcoal'
      : collection === 'holiday-damage'
        ? 'oxblood'
        : 'black';

  return (
    <Link
      href={href}
      className={['collection-banner group', className].filter(Boolean).join(' ')}
      data-collection={collection}
      data-theme={theme}
    >
      <div className="collection-banner-content">
        <div className="grid h-full gap-6 lg:grid-cols-[1.1fr_0.9fr] items-center">
          <div className="max-w-xl self-end lg:self-auto">
            <p className="section-kicker mb-3 opacity-90">{eyebrow}</p>
            <h3 className="text-[1.5rem] sm:text-[1.8rem] md:text-[2rem] mb-3 text-current">{title}</h3>
            <p className="text-sm sm:text-base text-current/82 mb-4 max-w-[34ch]">{description}</p>
            <span className="text-[12px] uppercase tracking-[0.12em] text-current/75">Shop Collection →</span>
          </div>

          <div className="hidden sm:block min-h-[12.5rem] lg:min-h-[14rem]">
            <GarmentMockup
              color={displayColor}
              artworkText={title}
              background={theme === 'bone' ? 'bone' : 'charcoal'}
              scale="medium"
              className="h-full w-full"
              decorative
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
