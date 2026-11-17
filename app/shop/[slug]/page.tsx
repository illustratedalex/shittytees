import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { getFeaturedProducts, getPublicProductBySlug } from '@/lib/catalog/service';
import { productImageUrls, productJsonLd, searchableProductTitle, serializeJsonLd } from '@/lib/seo/product';
import { defaultShareImage } from '@/lib/seo/site';
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

const loadPublicProduct = cache(async (slug: string) => getPublicProductBySlug(slug));

function productSocialImages(product: Product) {
  const primary = productImageUrls(product)[0];
  if (!primary) return [defaultShareImage];
  return [{ url: primary, alt: product.images[0]?.alt || product.name }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadPublicProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found | ShittyTees',
      description: 'The requested product could not be found.',
    };
  }

  const title = searchableProductTitle(product.name);
  const description = product.description;
  const images = productSocialImages(product);

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
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.map((image) => image.url),
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await loadPublicProduct(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = (await getFeaturedProducts()).filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(productJsonLd(product)) }}
      />
      <ProductDetailClient product={toProductViewModel(product)} relatedProducts={relatedProducts.map(toProductViewModel)} />
    </>
  );
}
