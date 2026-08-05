interface CampaignMarqueeProps {
  items: string[];
  className?: string;
  animated?: boolean;
}

export default function CampaignMarquee({ items, className, animated = true }: CampaignMarqueeProps) {
  const repeated = [...items, ...items];

  return (
    <section className={['overflow-hidden border-y border-[#f2ecde1e] bg-[#0b0b0b]', className].filter(Boolean).join(' ')} aria-label="Campaign highlights">
      <div className={`campaign-marquee-track ${animated ? 'campaign-marquee-animated' : ''}`}>
        {repeated.map((item, index) => (
          <span key={`${item}-${index}`} className="campaign-marquee-item">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
