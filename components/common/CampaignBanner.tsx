import Link from 'next/link';
import type { ReactNode } from 'react';

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
  className?: string;
}

export default function CampaignBanner({
  collection,
  title,
  description,
  href = '/collections',
  eyebrow = 'Campaign Lane',
  className,
}: CampaignBannerProps) {
  return (
    <Link
      href={href}
      className={['collection-banner group', className].filter(Boolean).join(' ')}
      data-collection={collection}
    >
      <div className="collection-banner-content">
        <div className="max-w-3xl">
          <p className="section-kicker mb-2 opacity-90">{eyebrow}</p>
          <h3 className="text-[1.45rem] sm:text-[1.9rem] md:text-[2.25rem] mb-2 text-current">{title}</h3>
          <p className="text-sm sm:text-base text-current/80 mb-3">{description}</p>
          <span className="text-[11px] uppercase tracking-[0.16em] text-current/72">Explore Collection →</span>
        </div>
      </div>
    </Link>
  );
}
