import type { Metadata } from 'next';
import { BRAND } from '@/data/brand';
import { HOMEPAGE_CAMPAIGN } from '@/data/campaigns';
import { DROPS } from '@/data/drops';
import { DEMO_PRODUCTS, getFeaturedProducts } from '@/lib/data/products';
import { SiteFooter, SiteHeader } from '@/components/layout';
import {
  CampaignHero,
  CampaignMarquee,
  CollectionBand,
  DropHero,
  DropSection,
  EditorialStatement,
} from '@/components/campaign';
import SectionHeading from '@/components/common/SectionHeading';
import NewsletterSignup from '@/components/common/NewsletterSignup';
import ProductRail from '@/components/product/ProductRail';

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
  const featured = getFeaturedProducts();
  const arrivals = featured.slice(0, 4);
  const drop = DROPS.find((item) => item.slug === 'drop-001') || DROPS[0];

  const dropProducts = DEMO_PRODUCTS.filter((product) =>
    drop?.featuredProductSlugs.includes(product.slug),
  );

  const heroProduct = dropProducts[0] || arrivals[0] || DEMO_PRODUCTS[0];

  return (
    <>
      <SiteHeader transparentOnTop />
      <main className="bg-[#0a0a0a] text-[#f0ebdf] overflow-x-clip">
        <CampaignHero
          eyebrow={HOMEPAGE_CAMPAIGN.hero.eyebrow}
          headline={HOMEPAGE_CAMPAIGN.hero.headline}
          body={HOMEPAGE_CAMPAIGN.hero.body}
          primaryCtaLabel={HOMEPAGE_CAMPAIGN.hero.primaryCtaLabel}
          primaryCtaHref={HOMEPAGE_CAMPAIGN.hero.primaryCtaHref}
          secondaryCtaLabel={HOMEPAGE_CAMPAIGN.hero.secondaryCtaLabel}
          secondaryCtaHref={HOMEPAGE_CAMPAIGN.hero.secondaryCtaHref}
          campaignLabel={HOMEPAGE_CAMPAIGN.hero.campaignLabel}
          theme={HOMEPAGE_CAMPAIGN.hero.theme}
          product={heroProduct}
        />

        <CampaignMarquee items={HOMEPAGE_CAMPAIGN.marqueeItems} />

        {drop ? (
          <DropHero
            dropNumber={drop.number}
            title={drop.title}
            releaseLabel={drop.label}
            description={drop.description}
            featuredProduct={heroProduct}
            ctaHref="/drops/drop-001"
            ctaLabel="Shop The Drop"
          />
        ) : null}

        <DropSection id="new-arrivals" tone="black">
          <SectionHeading
            title="New Arrivals"
            description="Latest premium graphics. Built to be worn hard."
            className="mb-8"
          />
          <ProductRail
            products={arrivals}
            descriptor={(product, index) => (index === 0 ? 'Latest drop piece' : product.category)}
            title="New Arrivals"
          />
        </DropSection>

        <EditorialStatement text={HOMEPAGE_CAMPAIGN.editorialStatement} />

        <CollectionBand campaigns={HOMEPAGE_CAMPAIGN.collectionBands} />

        <DropSection tone="black">
          <div className="max-w-3xl mx-auto px-0 sm:px-2 text-center">
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
