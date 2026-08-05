import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BRAND } from '@/data/brand';
import { DROPS, getDropBySlug } from '@/data/drops';
import { COLLECTION_CAMPAIGNS } from '@/data/collections';
import { DEMO_PRODUCTS } from '@/lib/data/products';
import { SiteFooter, SiteHeader } from '@/components/layout';
import { CollectionBand, DropHero, DropProductGrid, DropSection, DropStory } from '@/components/campaign';
import NewsletterSignup from '@/components/common/NewsletterSignup';

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
  const description = drop.description;

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

  const dropProducts = DEMO_PRODUCTS.filter((product) =>
    drop.featuredProductSlugs.includes(product.slug),
  );
  const storyProduct = dropProducts[0];

  return (
    <>
      <SiteHeader />
      <main className="bg-[#0a0a0a] pt-20 sm:pt-24">
        <DropHero
          dropNumber={drop.number}
          title={drop.title}
          releaseLabel={drop.label}
          description={drop.description}
          featuredProduct={storyProduct}
          ctaHref="/shop"
          ctaLabel="Shop This Drop"
          alternateTheme={drop.theme === 'oxblood'}
          headingLevel="h1"
        />

        <DropSection tone="charcoal">
          <DropStory
            eyebrow={`Drop ${drop.number}`}
            headline={drop.title}
            story={drop.story}
            quote={drop.description}
            product={storyProduct}
          />
        </DropSection>

        <DropSection tone="black">
          <DropProductGrid
            title="Drop Product Lineup"
            description="Available now from the active drop collection."
            products={dropProducts}
          />
        </DropSection>

        <CollectionBand
          campaigns={COLLECTION_CAMPAIGNS.filter((collection) =>
            drop.collectionSlug ? collection.slug === drop.collectionSlug : true,
          )}
        />

        <DropSection tone="black">
          <div className="max-w-3xl mx-auto">
            <NewsletterSignup
              title={BRAND.newsletterTitle}
              description={BRAND.newsletterBody}
              className="bg-transparent border border-[#f2ecde1f]"
            />
          </div>
        </DropSection>
      </main>
      <SiteFooter />
    </>
  );
}
