import type { Metadata } from 'next';
import Link from 'next/link';
import { getProductBySlug, getPublicProducts } from '@/lib/data/products';
import { resolveProductImage } from '@/lib/products/imageResolver';
import { SiteFooter, SiteHeader } from '@/components/layout';
import NewsletterSignup from '@/components/common/NewsletterSignup';
import ProductImageStage from '@/components/product/ProductImageStage';
import ProductTile from '@/components/product/ProductTile';

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

export default function Home() {
  const publicProducts = getPublicProducts();
  const arrivals = publicProducts.slice(0, 4);

  const heroProduct = getProductBySlug('professionally-unsupervised') || arrivals[0] || publicProducts[0];
  const heroImage = heroProduct ? resolveProductImage(heroProduct) : undefined;

  const dropFeature = getProductBySlug('professionally-unsupervised') || arrivals[1] || publicProducts[1];
  const dropImage = dropFeature ? resolveProductImage(dropFeature) : undefined;

  const collectionCards = [
    {
      slug: 'dark-humor',
      title: 'Dark Humor',
      description: 'Dry delivery, sharp prints, and questionable timing.',
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
    {
      slug: 'archive',
      title: 'Archive',
      description: 'Earlier designs and questionable decisions from the vault.',
    },
  ] as const;

  return (
    <>
      <SiteHeader transparentOnTop />
      <main className="bg-[#111111] text-[#f3efe6] overflow-x-clip pt-[4.75rem]">
        <section className="site-shell min-h-[72vh] py-10 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#aaa59c]">Drop 001</p>
            <h1 className="mt-4 text-[#f3efe6] text-[2.35rem] sm:text-[3rem] lg:text-[4rem] leading-[0.94]">
              Professionally
              <br />
              Unsupervised
            </h1>
            <p className="mt-5 text-[#d5d0c6] text-[1.02rem] max-w-[38ch]">
              High skill. Low oversight. Perfect results.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/drops/drop-001" className="btn btn--primary min-h-[48px] px-6">
                Shop Drop 001
              </Link>
              <Link href="/shop" className="btn btn--secondary min-h-[48px] px-6">
                View All Shirts
              </Link>
            </div>
          </div>
          <div>
            {heroImage ? (
              <ProductImageStage
                image={heroImage}
                className="w-full max-w-[38rem] mx-auto"
                priority
                sizes="(max-width: 1023px) 92vw, 608px"
              />
            ) : null}
          </div>
        </section>

        <section className="site-shell section-shell" id="new-arrivals">
          <div className="mb-8">
            <h2 className="text-[#f3efe6] text-[1.8rem]">New Arrivals</h2>
            <p className="text-[#aaa59c] mt-2">Latest drops and questionable decisions.</p>
          </div>
          <div className="grid grid-cols-1 min-[430px]:grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-5">
            {arrivals.map((product) => (
              <ProductTile key={product.id} product={product} />
            ))}
          </div>
        </section>

        <section className="site-shell section-shell grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-8 lg:gap-12 items-center">
          <div>
            {dropImage ? <ProductImageStage image={dropImage} className="w-full" sizes="(max-width: 1023px) 92vw, 46vw" /> : null}
          </div>
          <div>
            <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#aaa59c]">Drop 001</p>
            <h2 className="text-[2rem] sm:text-[2.6rem] mt-3 text-[#f3efe6] leading-[0.96]">Professionally Unsupervised</h2>
            <p className="text-[#d5d0c6] mt-4 max-w-[36ch]">High skill. Low oversight. Perfect results.</p>
            <Link href="/drops/drop-001" className="btn btn--primary min-h-[48px] px-6 mt-7 inline-flex">
              Shop The Drop
            </Link>
          </div>
        </section>

        <section className="site-shell section-shell">
          <div className="mb-8">
            <h2 className="text-[#f3efe6] text-[1.8rem]">Featured Collections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {collectionCards.map((collection) => {
              const sourceProduct = publicProducts.find((item) => item.collectionSlug === collection.slug) || publicProducts[0];
              const collectionImage = sourceProduct ? resolveProductImage(sourceProduct) : undefined;

              return (
                <article key={collection.slug} className="bg-[#1b1b1b] border border-[#2f2f2f] rounded-2xl p-5 sm:p-6">
                  {collectionImage ? (
                    <ProductImageStage image={collectionImage} className="mb-5" />
                  ) : null}
                  <h3 className="text-[#f3efe6] normal-case text-[1.4rem]">{collection.title}</h3>
                  <p className="text-[#aaa59c] mt-2">{collection.slug === 'archive' ? 'Earlier ShittyTees designs and questionable decisions from the vault.' : collection.description}</p>
                  <Link href={`/collections/${collection.slug}`} className="mt-5 inline-flex min-h-[44px] items-center text-[#f3efe6] underline underline-offset-4 hover:text-white">
                    Shop Collection
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className="bg-[#f3efe6] mt-4">
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
