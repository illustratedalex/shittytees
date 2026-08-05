import type { CollectionCampaign } from '@/data/collections';
import CampaignBanner from './CampaignBanner';

interface CollectionBandProps {
  campaigns: CollectionCampaign[];
  className?: string;
}

export default function CollectionBand({ campaigns, className }: CollectionBandProps) {
  return (
    <section className={['bg-[#0f0f0f] py-16 sm:py-20 lg:py-24', className].filter(Boolean).join(' ')}>
      <div className="max-w-[96rem] mx-auto px-5 sm:px-8 lg:px-12">
        <h2 className="text-[#f0ebdf] text-[2rem] sm:text-[2.8rem] md:text-[3.7rem] leading-[0.95] mb-8">Collection Campaigns</h2>
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <CampaignBanner key={campaign.slug} campaign={campaign} />
          ))}
        </div>
      </div>
    </section>
  );
}
