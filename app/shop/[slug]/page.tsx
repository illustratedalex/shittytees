import Link from 'next/link';
import { getProductBySlug, getFeaturedProducts } from '@/lib/data/products';
import ProductDetailClient, { ProductViewModel } from './ProductDetailClient';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

function toProductViewModel(product: ReturnType<typeof getProductBySlug> extends infer T ? Exclude<T, undefined> : never): ProductViewModel {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    category: product.category,
    collectionSlug: product.collectionSlug,
    retailPrice: product.retailPrice,
    images: product.images.map((image) => ({
      id: image.id,
      src: image.src,
      alt: image.alt,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      printfulVariantId: variant.printfulVariantId,
      size: variant.size,
      color: variant.color,
      retailPrice: variant.retailPrice,
      available: variant.available,
    })),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0d0c]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#f2ecde] mb-4">Product Not Found</h1>
          <Link href="/shop" className="text-[#d4cdbc] hover:text-[#f2ecde] font-semibold">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = getFeaturedProducts().filter((item) => item.slug !== slug).slice(0, 3);

  return <ProductDetailClient product={toProductViewModel(product)} relatedProducts={relatedProducts.map(toProductViewModel)} />;
}
