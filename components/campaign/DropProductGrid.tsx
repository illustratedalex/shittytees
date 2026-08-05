import type { Product } from '@/lib/types/product';
import ProductTile from '@/components/product/ProductTile';
import SectionHeading from '@/components/common/SectionHeading';

interface DropProductGridProps {
  title: string;
  description?: string;
  products: Product[];
}

export default function DropProductGrid({ title, description, products }: DropProductGridProps) {
  return (
    <div>
      <SectionHeading title={title} description={description} className="mb-8" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {products.map((product) => (
          <ProductTile key={product.id} product={product} badge={product.featured ? 'New' : undefined} />
        ))}
      </div>
    </div>
  );
}
