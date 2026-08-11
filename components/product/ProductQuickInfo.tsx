import type { MerchProduct } from './types';
import Price from '@/components/common/Price';

interface ProductQuickInfoProps {
  product: MerchProduct;
  descriptor?: string;
  badge?: string;
  className?: string;
}

export default function ProductQuickInfo({ product, descriptor, badge, className }: ProductQuickInfoProps) {
  const tagline = descriptor || product.shortDescription;

  return (
    <div className={['space-y-2.5', className].filter(Boolean).join(' ')}>
      <div className="flex items-start justify-between gap-4">
        <p className="text-[0.63rem] uppercase tracking-[0.2em] text-[#9f9787]">{product.category}</p>
        {badge ? <span className="badge badge--clean">{badge}</span> : null}
      </div>

      <h3 className="text-[#f2e8d5] text-[1.2rem] sm:text-[1.32rem] normal-case tracking-[0.01em] leading-[1.08]">
        {product.name}
      </h3>

      <p className="text-[0.92rem] leading-[1.45] text-[#c9beaa]">{tagline}</p>

      <Price amount={product.retailPrice} currency={product.currency || 'USD'} className="text-[1.03rem] text-[#f2e8d5]" />
    </div>
  );
}
