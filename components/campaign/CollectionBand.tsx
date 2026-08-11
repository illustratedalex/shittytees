import type { CollectionCampaign } from '@/data/collections';
import CampaignBanner from '@/components/common/CampaignBanner';

interface CollectionBandProps {
  campaigns: CollectionCampaign[];
  className?: string;
}

export default function CollectionBand({ campaigns, className }: CollectionBandProps) {
  return (
    <section className={['bg-[#13110f] py-16 sm:py-18 lg:py-20', className].filter(Boolean).join(' ')}>
      <div className="max-w-[84rem] mx-auto px-5 sm:px-8 lg:px-10">
        <p className="section-kicker mb-3">Collections</p>
        <h2 className="text-[#f0ebdf] text-[1.9rem] sm:text-[2.3rem] md:text-[2.75rem] leading-[0.98] mb-3">Shop by Collection</h2>
        <p className="text-sm sm:text-base text-[#bdb3a0] max-w-2xl mb-8">Clear lanes for every mood, from dark humor staples to limited seasonal damage.</p>
        <div className="collection-grid">
          {campaigns.map((campaign) => (
            <CampaignBanner
              key={campaign.slug}
              collection={campaign.slug}
              title={campaign.title}
              description={campaign.description}
              href={campaign.href || '/collections'}
              eyebrow="Shop Collection"
              theme={campaign.theme}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
