import { DEMO_PRODUCTS } from '@/lib/data/products';
import { SiteFooter, SiteHeader } from '@/components/layout';
import SectionHeading from '@/components/common/SectionHeading';
import ProductRail from '@/components/product/ProductRail';

export const dynamic = 'force-static';

export default function ShopPage() {
  const products = DEMO_PRODUCTS.filter((product) => product.active);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#0e0d0c] pt-20 sm:pt-24">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <SectionHeading
            kicker="Storefront"
            title="Shop All"
            description="All products. All questionable."
            headingLevel="h1"
            className="mb-10"
          />
          <ProductRail
            products={products}
            descriptor={(product) => product.category}
            title="Shop all products"
          />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
