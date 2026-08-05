import { getProductsByCollection } from '@/lib/data/products';
import { COLLECTION_CAMPAIGNS } from '@/data/collections';
import { SiteFooter, SiteHeader } from '@/components/layout';
import SectionHeading from '@/components/common/SectionHeading';
import CollectionBand from '@/components/campaign/CollectionBand';
import ProductTile from '@/components/product/ProductTile';

export const dynamic = 'force-static';

export default function CollectionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#0e0d0c] pt-20 sm:pt-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <SectionHeading
            kicker="Collection Index"
            title="Collections"
            description="Campaign lanes and product groupings for each ShittyTees mood."
            headingLevel="h1"
            className="mb-10"
          />
        </section>

        <CollectionBand campaigns={COLLECTION_CAMPAIGNS} className="pt-0" />

        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
            {COLLECTION_CAMPAIGNS.map((campaign, index) => {
              const products = getProductsByCollection(campaign.slug);
              return (
                <div key={campaign.slug}>
                  <SectionHeading
                    kicker={`Lane ${String(index + 1).padStart(2, '0')}`}
                    title={campaign.title}
                    description={campaign.description}
                    className="mb-7"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                    {products.map((product) => (
                      <ProductTile
                        key={product.id}
                        product={product}
                        descriptor={product.category}
                        badge={product.featured ? 'New' : 'Drop'}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
