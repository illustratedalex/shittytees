import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicProductBySlug, getPublicProducts } from '@/lib/catalog/service';
import { resolveProductImage } from '@/lib/products/imageResolver';
import { SiteFooter, SiteHeader } from '@/components/layout';
import NewsletterSignup from '@/components/common/NewsletterSignup';
import ProductImageStage from '@/components/product/ProductImageStage';
import ProductTile from '@/components/product/ProductTile';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ShittyTees | Terrible Ideas. Excellent Shirts.',
  description: 'Independent apparel with dark humor, premium blanks, and zero interest in behaving.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'ShittyTees | Terrible Ideas. Excellent Shirts.',
    description: 'Independent apparel with dark humor, premium blanks, and zero interest in behaving.',
    type: 'website',
    url: 'https://shittytees.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ShittyTees | Terrible Ideas. Excellent Shirts.',
    description: 'Independent apparel with dark humor, premium blanks, and zero interest in behaving.',
  },
};

export default async function Home() {
  const publicProducts = await getPublicProducts();
  const arrivals = publicProducts.slice(0, 6);

  const heroProduct = (await getPublicProductBySlug('professionally-unsupervised')) || arrivals[0] || publicProducts[0];

  const featuredProduct = (await getPublicProductBySlug('bad-decisions-department'))
    || publicProducts.find((product) => product.featured)
    || arrivals[1]
    || publicProducts[1];

  const featuredImage = featuredProduct ? resolveProductImage(featuredProduct) : undefined;

  const collectionCards = [
    {
      slug: 'dark-humor',
      title: 'Dark Humor',
      description: 'Dry delivery, sharp prints, and questionable timing.',
    },
    {
      slug: 'artists-bench',
      title: "Artist's Bench",
      description: 'Sketchbooks, shop floors, late nights, and the people who make things by hand.',
    },
    {
      slug: 'blue-collar',
      title: 'Blue Collar',
      description: 'Built for night shifts, shop floors, and after-hours detours.',
    },
    {
      slug: 'tattoo-culture',
      title: 'Tattoo Culture',
      description: 'Linework-heavy graphics with clean premium blanks.',
    },
  ] as const;

  return (
    <>
      <SiteHeader transparentOnTop />
      <main className="bg-[#0b0b0b] text-[#f2e8d5] overflow-x-clip pt-[5rem]">
        <section className="site-shell home-hero-shell">
          <p className="home-hero-kicker">ShittyTees</p>
          <h1 className="home-hero-title">
            TERRIBLE IDEAS.
            <br />
            EXCELLENT SHIRTS.
          </h1>
          <p className="home-hero-subcopy">Graphic tees for questionable people with excellent taste.</p>
          <div className="home-hero-actions">
            <Link href="/drops/drop-001" className="btn btn--primary min-h-[50px] px-7">
              Shop The Drop
            </Link>
            <Link href="/shop" className="btn btn--secondary min-h-[50px] px-7">
              Shop All
            </Link>
          </div>
        </section>

        <section className="site-shell section-shell pt-6" id="new-arrivals">
          <div className="section-heading-shell mb-10">
            <p className="section-heading-kicker">Latest Bad Decisions</p>
            <h2 className="section-heading-title">LATEST BAD DECISIONS</h2>
            <p className="section-heading-subcopy">Freshly printed mistakes.</p>
          </div>

          <div className="shop-grid">
            {arrivals.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                badge={product.tags?.includes('new-arrival') ? 'New' : undefined}
              />
            ))}
          </div>
        </section>

        <section className="site-shell section-shell featured-product-shell">
          <div className="featured-product-frame">
            <div>
              {featuredImage ? (
                <ProductImageStage
                  image={featuredImage}
                  className="featured-product-media"
                  priority={featuredProduct?.id === heroProduct?.id}
                  sizes="(max-width: 1023px) 92vw, 46vw"
                />
              ) : null}
            </div>
            <div className="featured-product-copy">
              <p className="featured-product-kicker">Featured Shirt</p>
              <h2 className="featured-product-title">{featuredProduct?.name || 'Bad Decisions Department'}</h2>
              <p className="featured-product-description">
                {featuredProduct?.shortDescription || 'Open enrollment, no interview required.'}
              </p>
              <p className="featured-product-price">${(featuredProduct?.retailPrice || 36).toFixed(2)}</p>
              <Link href={featuredProduct ? `/shop/${featuredProduct.slug}` : '/shop'} className="btn btn--primary min-h-[50px] px-7 mt-2 inline-flex">
                Get This Terrible Idea
              </Link>
            </div>
          </div>
        </section>

        <section className="site-shell section-shell">
          <div className="mb-8">
            <h2 className="text-[#f2e8d5] text-[1.6rem] sm:text-[1.9rem] tracking-[0.03em]">Shop by Collection</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {collectionCards.map((collection) => {
              const sourceProduct = publicProducts.find((item) => item.collectionSlug === collection.slug);
              const collectionImage = sourceProduct ? resolveProductImage(sourceProduct) : undefined;

              return (
                <article key={collection.slug} className="collection-feature-card">
                  {collectionImage ? <ProductImageStage image={collectionImage} className="mb-5" /> : null}
                  <h3 className="text-[#f2e8d5] normal-case text-[1.35rem]">{collection.title}</h3>
                  <p className="text-[#c1b6a2] mt-2">{collection.description}</p>
                  <Link href={`/collections/${collection.slug}`} className="mt-5 inline-flex min-h-[44px] items-center underline underline-offset-4 text-[#f2e8d5] hover:text-white">
                    Shop Collection
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="mt-8">
            <Link href="/collections/archive" className="inline-flex min-h-[44px] items-center text-[#f2b8c4] underline underline-offset-4 hover:text-[#ffd75a]">
              Explore the Archive
            </Link>
          </div>
        </section>

        <section className="bg-[#f2e8d5] mt-4">
          <div className="site-shell py-16 md:py-20">
            <p className="max-w-[900px] text-[#111111] text-[2rem] md:text-[2.8rem] lg:text-[3.4rem] leading-[1.08] font-medium">
              Made for tattoo shops, garages, dive bars, night shifts, bad decisions, and people who laugh at the wrong time.
            </p>
          </div>
        </section>

        <section className="site-shell section-shell pt-14">
          <NewsletterSignup
            title="Join the bad influence."
            description="New drops, questionable ideas, and occasional bad decisions."
            className="border-[#2f2f2f]"
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
