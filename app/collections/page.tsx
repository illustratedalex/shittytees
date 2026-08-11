import type { Metadata } from 'next';
import Link from 'next/link';
import { getProductsByCollection } from '@/lib/catalog/service';
import { resolveProductImage } from '@/lib/products/imageResolver';
import BrandPattern from '@/components/brand/BrandPattern';
import { SiteFooter, SiteHeader } from '@/components/layout';
import ProductImageStage from '@/components/product/ProductImageStage';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Collections | ShittyTees',
  description: 'Explore collection lanes across Drop 001, dark humor, tattoo culture, blue collar, and limited releases.',
  alternates: {
    canonical: '/collections',
  },
  openGraph: {
    title: 'Collections | ShittyTees',
    description: 'Explore collection lanes across Drop 001, dark humor, tattoo culture, blue collar, and limited releases.',
    type: 'website',
    url: 'https://shittytees.com/collections',
  },
};

export default async function CollectionsPage() {
  const collectionCards = [
    {
      slug: 'dark-humor',
      title: 'Dark Humor',
      description: 'Dry delivery, sharp prints, and premium everyday blanks.',
    },
    {
      slug: 'artists-bench',
      title: "Artist's Bench",
      description: 'Sketchbooks, shop floors, late nights, and the people who make things by hand.',
    },
    {
      slug: 'blue-collar',
      title: 'Blue Collar',
      description: 'Built for long shifts, garages, and after-hours honesty.',
    },
    {
      slug: 'tattoo-culture',
      title: 'Tattoo Culture',
      description: 'Linework graphics with durable print quality and clean fit.',
    },
  ] as const;

  const cardsWithProducts = await Promise.all(
    collectionCards.map(async (collection) => {
      const products = await getProductsByCollection(collection.slug);
      return {
        collection,
        products,
      };
    }),
  );

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#111111] pt-[4.75rem]">
        <section className="site-shell section-shell">
          <header className="mb-10">
            <h1 className="text-[#f3efe6] text-[2.2rem] sm:text-[3rem]">Collections</h1>
            <p className="text-[#aaa59c] mt-3 max-w-[52ch]">Four clear lanes built for easy browsing and fast shopping.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cardsWithProducts.map(({ collection, products }) => {
              const lead = products[0];
              const leadImage = lead ? resolveProductImage(lead) : undefined;
              const isArtistsBench = collection.slug === 'artists-bench';

              return (
                <article key={collection.slug} className={`relative overflow-hidden rounded-2xl p-5 sm:p-6 border ${isArtistsBench ? 'bg-[#f1eadf] border-[#d7cebf]' : 'bg-[#1b1b1b] border-[#2f2f2f]'}`}>
                  {isArtistsBench ? <BrandPattern variant="dark" className="absolute inset-0 opacity-60 pointer-events-none" /> : null}
                  <div className="relative z-10">
                    {leadImage ? <ProductImageStage image={leadImage} className="mb-5" /> : isArtistsBench ? <div className="mb-5 aspect-[4/5] rounded-[0.85rem] border border-[#d4cab9] bg-[linear-gradient(135deg,#f6f1e7,#ebe3d5)] relative overflow-hidden"><div className="absolute left-5 top-5 h-5 w-5 border border-[#6a6359] opacity-60" /><div className="absolute right-7 top-10 h-px w-14 bg-[#6a6359] opacity-50" /><div className="absolute left-8 bottom-8 h-px w-20 bg-[#6a6359] opacity-50" /><div className="absolute bottom-6 right-6 rotate-[-5deg] border border-[#cabfae] bg-[#faf4e9] px-3 py-1 text-[0.68rem] uppercase tracking-[0.12em] text-[#4d473d]">Coming Soon</div></div> : null}
                    <h2 className={`normal-case text-[1.6rem] ${isArtistsBench ? 'text-[#111111]' : 'text-[#f3efe6]'}`}>{collection.title}</h2>
                    <p className={`${isArtistsBench ? 'text-[#4d473d]' : 'text-[#aaa59c]'} mt-2`}>{collection.description}</p>
                    <Link href={`/collections/${collection.slug}`} className={`mt-5 inline-flex min-h-[44px] items-center underline underline-offset-4 ${isArtistsBench ? 'text-[#111111] hover:text-[#39342d]' : 'text-[#f3efe6] hover:text-white'}`}>
                    Shop Collection
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-8">
            <Link href="/collections/archive" className="inline-flex min-h-[44px] items-center text-[#aaa59c] underline underline-offset-4 hover:text-[#f3efe6]">
              Explore the Archive
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
