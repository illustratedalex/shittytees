import type { Metadata } from 'next';
import { getPublicProducts } from '@/lib/catalog/service';
import { SiteFooter, SiteHeader } from '@/components/layout';
import ProductTile from '@/components/product/ProductTile';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop All Shirts | ShittyTees',
  description: 'Browse every current ShittyTees release, including Drop 001 and core collection graphics.',
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Shop All Shirts | ShittyTees',
    description: 'Browse every current ShittyTees release, including Drop 001 and core collection graphics.',
    type: 'website',
    url: 'https://shittytees.com/shop',
  },
};

export default async function ShopPage() {
  const products = await getPublicProducts();

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#0b0b0b] pt-[5rem]">
        <section className="site-shell section-shell pb-9">
          <header className="shop-intro-shell">
            <p className="shop-overline">ShittyTees</p>
            <h1 className="shop-title">TERRIBLE IDEAS. EXCELLENT SHIRTS.</h1>
            <p className="shop-subcopy">Graphic tees for questionable people with excellent taste.</p>
            <p className="shop-product-count">{products.length} products live now</p>
          </header>

          <div className="shop-grid mt-12">
            {products.map((product) => (
              <ProductTile
                key={product.id}
                product={product}
                badge={product.tags?.includes('new-arrival') ? 'New' : undefined}
              />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
