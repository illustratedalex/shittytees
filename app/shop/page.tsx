import { SHITTY_COLLECTIONS } from '@/data/shittyCollections';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublicProducts } from '@/lib/catalog/service';
import { SiteFooter, SiteHeader } from '@/components/layout';
import ProductTile from '@/components/product/ProductTile';
import DesignShowcase from '@/components/product/DesignShowcase';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'The Shirts | Shitty Tees',
  description: 'Original graphic shirts with dark humor and absolutely no filter.',
  alternates: { canonical: '/shop' },
  openGraph: {
    title: 'The Shirts | Shitty Tees',
    description: 'Original graphic shirts with dark humor and absolutely no filter.',
    url: '/shop',
    type: 'website',
  },
};
export default async function ShopPage() {
 const products = await getPublicProducts();
 return <><SiteHeader /><main className="storefront"><section className="store-section site-shell"><p className="store-eyebrow">Wear your bad attitude</p><h1 className="store-page-title">THE SHIRTS.</h1><p className="store-page-description">Good graphics. Questionable messages.</p><nav className="store-filter-links" aria-label="Shirt collections"><Link href="/shop" aria-current="page">All shirts</Link>{SHITTY_COLLECTIONS.map(c=><Link key={c.slug} href={'/collections/'+c.slug}>{c.name}</Link>)}<Link href="/collections/archive">Archive</Link></nav>{products.length ? <div className="shop-grid">{products.map(product=><ProductTile key={product.id} product={product}/>)}</div> : <div className="store-release-message"><h2>A BETTER DROP IS ON THE WAY.</h2><p>We’re rebuilding the shirts and the store. Here’s what’s coming next.</p></div>}<div className="store-section-heading next-design-heading"><div><p className="store-eyebrow">Coming soon</p><h2>THE NEXT RELEASE.</h2></div></div><DesignShowcase excludeSlugs={products.map(product => product.slug)} /></section></main><SiteFooter /></>;
}
