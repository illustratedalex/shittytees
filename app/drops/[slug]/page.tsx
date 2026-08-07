import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BRAND } from '@/data/brand';
import { DROPS, getDropBySlug } from '@/data/drops';
import { getPublicProducts } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/products/imageResolver';
import { SiteFooter, SiteHeader } from '@/components/layout';
import NewsletterSignup from '@/components/common/NewsletterSignup';
import ProductImageStage from '@/components/product/ProductImageStage';
import ProductTile from '@/components/product/ProductTile';

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return DROPS.map((drop) => ({ slug: drop.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const drop = getDropBySlug(slug);

  if (!drop) {
    return {
      title: 'Drop Not Found | ShittyTees',
    };
  }

  const title = `ShittyTees Drop ${drop.number} | ${drop.title}`;
  const description = `${drop.description} ${drop.story}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/drops/${drop.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `https://shittytees.com/drops/${drop.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function DropPage({ params }: Props) {
  const { slug } = await params;
  const drop = getDropBySlug(slug);

  if (!drop) {
    notFound();
  }

  const dropProducts = getPublicProducts().filter((product) =>
    drop.featuredProductSlugs.includes(product.slug),
  );
  const storyProduct = dropProducts[0] || getPublicProducts()[0];
  const storyImage = storyProduct ? resolveProductImage(storyProduct) : undefined;

  return (
    <>
      <SiteHeader />
      <main className="bg-[#111111] pt-[4.75rem]">
        <section className="site-shell section-shell grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#aaa59c]">Drop {drop.number}</p>
            <h1 className="mt-4 text-[#f3efe6] text-[2.3rem] sm:text-[3rem] lg:text-[4rem] leading-[0.94]">{drop.title}</h1>
            <p className="text-[#d5d0c6] mt-4 max-w-[40ch]">{drop.description}</p>
            <p className="text-[#aaa59c] mt-4 max-w-[42ch]">{drop.story}</p>
            <Link href="/shop" className="btn btn--primary min-h-[48px] px-6 mt-7 inline-flex">
              Shop The Drop
            </Link>
          </div>
          <div>
            {storyImage ? <ProductImageStage image={storyImage} className="w-full" priority sizes="(max-width: 1023px) 92vw, 46vw" /> : null}
          </div>
        </section>

        <section className="site-shell section-shell pt-4">
          <h2 className="text-[#f3efe6] text-[1.8rem]">Drop Lineup</h2>
          <p className="text-[#aaa59c] mt-2">Available now from this release.</p>
          <div className="mt-8 grid grid-cols-1 min-[430px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {dropProducts.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="site-shell section-shell pt-12">
          <div className="max-w-3xl mx-auto">
            <NewsletterSignup
              title={BRAND.newsletterTitle}
              description={BRAND.newsletterBody}
              className="border-[#2f2f2f]"
            />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
