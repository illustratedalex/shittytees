import type { MerchProduct } from './types';
import Price from '@/components/common/Price';
import ProductLabel from '@/components/common/ProductLabel';

interface ProductQuickInfoProps {
  product: MerchProduct;
  className?: string;
}

export default function ProductQuickInfo({ product, className }: ProductQuickInfoProps) {
  return (
    <div className={['space-y-2', className].filter(Boolean).join(' ')}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[#f2ecde] text-base sm:text-[1.05rem] normal-case tracking-[0.01em]">{product.name}</h3>
        <ProductLabel category={product.category} status={product.featured ? 'new' : 'core'} />
      </div>
      <p className="text-sm text-[#bdb3a0]">{product.shortDescription}</p>
      <Price amount={product.retailPrice} currency={product.currency || 'USD'} />
    </div>
  );
}
