import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getFeaturedProducts, getPublicProductBySlug } from '@/lib/catalog/service';
import type { Product } from '@/lib/types/product';
import ProductDetailClient, { ProductViewModel } from './ProductDetailClient';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

function toProductViewModel(product: Product): ProductViewModel {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    shortDescription: product.shortDescription,
    category: product.category,
    collectionSlug: product.collectionSlug,
    retailPrice: product.retailPrice,
    currency: product.currency,
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | ShittyTees',
      description: 'The requested product could not be found.',
    };
  }

  const title = `${product.name} | ShittyTees`;
  const description = product.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/shop/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://shittytees.com/shop/${product.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getPublicProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getFeaturedProducts()).filter((item) => item.slug !== slug).slice(0, 3);

  return <ProductDetailClient product={toProductViewModel(product)} relatedProducts={relatedProducts.map(toProductViewModel)} />;
}
