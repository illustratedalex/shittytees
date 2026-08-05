import type { Product } from '@/lib/types/product';
import GarmentMockup from '@/components/product/GarmentMockup';

interface DropStoryProps {
  eyebrow: string;
  headline: string;
  story: string;
  quote?: string;
  product?: Product;
  reverse?: boolean;
}

export default function DropStory({ eyebrow, headline, story, quote, product, reverse = false }: DropStoryProps) {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center ${reverse ? 'lg:[&>*:first-child]:order-2' : ''}`}>
      <div>
        <p className="section-kicker mb-3">{eyebrow}</p>
        <h2 className="text-[#f0ebdf] text-[2rem] sm:text-[2.75rem] md:text-[3.3rem] leading-[0.94] mb-5">{headline}</h2>
        <p className="text-[#d4c8b3] text-sm sm:text-base leading-relaxed max-w-xl mb-6">{story}</p>
        {quote ? <blockquote className="text-[#f0ebdf] text-base sm:text-lg italic border-l border-[#f2ecde3b] pl-4">"{quote}"</blockquote> : null}
      </div>
      <div className="min-h-[20rem] sm:min-h-[24rem] lg:min-h-[30rem]">
        <GarmentMockup
          color="charcoal"
          artworkText={product?.name || headline}
          background="black"
          scale="large"
          rotation={reverse ? -1.4 : 1.4}
          className="h-full w-full"
        />
      </div>
    </div>
  );
}
