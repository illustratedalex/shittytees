import type { Metadata } from 'next';
import Link from 'next/link';
import { getCollectionBySlug, getProductsByCollection } from '@/lib/catalog/service';
import ProductTile from '@/components/product/ProductTile';
import { SiteFooter, SiteHeader } from '@/components/layout';

const COLLECTION_BODY_COPY: Record<string, string> = {
  'artists-bench': 'Built from the same place good tattoos start: a rough idea, a sharp eye, too much coffee, and a workbench covered in evidence.',
};

export const dynamic = 'force-dynamic';

export async function getCollectionPageState(slug: string) {
  const collection = getCollectionBySlug(slug);
  const products = collection ? await getProductsByCollection(collection.slug) : [];

  return {
    collection,
    products,
    isArchive: collection?.slug === 'archive',
    isComingSoon: collection?.slug === 'artists-bench' && products.length === 0,
    bodyCopy: collection ? COLLECTION_BODY_COPY[collection.slug] || collection.description : undefined,
  };
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) {
    return {
      title: 'Collection Not Found | ShittyTees',
      description: 'The requested collection could not be found.',
    };
  }

  return {
    title: `${collection.name} | ShittyTees`,
    description: collection.slug === 'artists-bench'
      ? 'Original ShittyTees apparel inspired by sketchbooks, tattoo shops, late nights, and the people who make things by hand.'
      : collection.description,
  };
}

export default async function CollectionSlugPage({ params }: Props) {
  const { slug } = await params;
  const { collection, products, isArchive, isComingSoon, bodyCopy } = await getCollectionPageState(slug);

  if (!collection) {
    return (
      <main className="min-h-screen bg-[#111111] pt-[7rem] px-5">
        <div className="max-w-4xl mx-auto bg-[#1b1b1b] border border-[#2f2f2f] rounded-2xl p-8">
          <h1 className="text-[#f3efe6] text-2xl mb-2">Collection not found</h1>
          <Link href="/collections" className="text-[#f3efe6] underline">Back to Collections</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#111111] pt-[4.75rem] pb-10">
        <div className="site-shell section-shell">
          <p className="text-xs uppercase tracking-[0.16em] text-[#aaa59c] mb-3">Collection</p>
          <h1 className="text-[#f3efe6] text-3xl mb-2">{isArchive ? 'Archive' : collection.name}</h1>
          <p className="text-[#aaa59c] mb-8 max-w-2xl">
            {isArchive
              ? 'Earlier ShittyTees designs and questionable decisions from the vault.'
              : bodyCopy}
          </p>

          {isComingSoon ? (
            <div className="bg-[#1b1b1b] border border-[#2f2f2f] rounded-2xl p-8 sm:p-10 max-w-3xl">
              <p className="text-[0.78rem] uppercase tracking-[0.14em] text-[#aaa59c] mb-3">Coming Soon</p>
              <h2 className="text-[#f3efe6] text-[1.8rem] normal-case mb-3">The bench is messy. The first pieces are coming.</h2>
              <p className="text-[#aaa59c] max-w-[42ch] mb-6">
                Artist&apos;s Bench is a permanent collection for sketchbook discipline, bench-top culture, and the working artist mindset. The first finished pieces are still in development.
              </p>
              <Link href="/drops/drop-001" className="btn btn--primary min-h-[48px] px-6 inline-flex">
                Shop Drop 001
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 min-[430px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductTile key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
