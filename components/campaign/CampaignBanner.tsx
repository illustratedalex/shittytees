import type { CollectionCampaign } from '@/data/collections';
import CampaignBannerCard from '@/components/common/CampaignBanner';

interface CampaignBannerProps {
  campaign: CollectionCampaign;
  className?: string;
}

export default function CampaignBanner({ campaign, className }: CampaignBannerProps) {
  return (
    <CampaignBannerCard
      collection={campaign.slug}
      title={campaign.title}
      description={campaign.description}
      href={campaign.href || '/collections'}
      className={className}
    />
  );
}
