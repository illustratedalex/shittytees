import ProductTile from './ProductTile';
import type { MerchProduct } from './types';

interface ProductRailProps {
  products: MerchProduct[];
  className?: string;
  tileClassName?: string;
  descriptor?: (product: MerchProduct, index: number) => string | undefined;
  title?: string;
}

export default function ProductRail({
  products,
  className,
  tileClassName,
  descriptor,
  title,
}: ProductRailProps) {
  return (
    <section className={className} aria-label={title || 'Product rail'}>
      <div className="sm:hidden -mx-5 px-5 overflow-x-auto pb-2">
        <ul className="flex gap-4 snap-x snap-mandatory">
          {products.map((product, index) => (
            <li key={product.id} className="min-w-[82%] snap-start">
              <ProductTile
                product={product}
                className={tileClassName}
                descriptor={descriptor?.(product, index)}
                badge={product.tags?.includes('new-arrival') ? 'New' : undefined}
              />
            </li>
          ))}
        </ul>
      </div>

      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-x-10 lg:gap-y-14">
        {products.map((product, index) => (
          <ProductTile
            key={product.id}
            product={product}
            className={tileClassName}
            descriptor={descriptor?.(product, index)}
            badge={product.tags?.includes('new-arrival') ? 'New' : undefined}
          />
        ))}
      </div>
    </section>
  );
}
