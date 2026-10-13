import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getPublicProducts } from '@/lib/catalog/service';
import { SiteFooter, SiteHeader } from '@/components/layout';
import ProductTile from '@/components/product/ProductTile';
import DesignShowcase from '@/components/product/DesignShowcase';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Shitty Tees — Wear your bad attitude.', description: 'Original graphic tees. Dark humor, questionable leadership, and absolutely no filter.' };
export default async function Home() {
  const products = await getPublicProducts();
  return <><SiteHeader /><main className="storefront">
    <section className="store-hero site-shell">
      <div className="store-hero-copy"><p className="store-eyebrow">Independent graphics. Questionable taste.</p><h1>GOOD SHIRTS.<br /><span>BAD ATTITUDE.</span></h1><p className="store-hero-description">For people who have a lot to say and very little interest in saying it politely.</p><div className="store-actions"><Link className="store-button" href={products.length ? '/shop' : '#next-release'}>{products.length ? 'Find your next bad decision' : 'Meet the next release'} <span>↗</span></Link><Link className="store-text-link" href="/collections/shitty-politics">Explore Shitty Politics →</Link></div><p className="store-hero-footnote">Original designs. Zero filter.</p></div>
      <div className="store-hero-image"><Image src="/images/designs/dead-tired-mockup.png" alt="Dead Tired — Still a Problem black shirt concept" fill priority sizes="(max-width: 800px) 92vw, 50vw" className="object-cover" unoptimized /><span className="hero-sticker">DEAD TIRED.<br />STILL A PROBLEM.</span><span className="hero-image-note">Next release · Visual mockup</span></div>
    </section>
    <div className="store-ticker" aria-hidden="true">TERRIBLE IDEAS. EXCELLENT SHIRTS. <span>✳</span> WEAR YOUR BAD ATTITUDE. <span>✳</span> TERRIBLE IDEAS. EXCELLENT SHIRTS.</div>
    {products.length ? <section className="store-section site-shell"><div className="store-section-heading"><div><p className="store-eyebrow">Ready to cause problems</p><h2>THE SHIRTS.</h2></div><Link href="/shop">Shop all →</Link></div><div className="shop-grid">{products.slice(0,6).map(product => <ProductTile key={product.id} product={product} />)}</div></section> : null}
    <section className="store-section site-shell" id="next-release"><div className="store-section-heading"><div><p className="store-eyebrow">The next bad decisions</p><h2>FRESH ATTITUDE.</h2></div><p>Meet the next release.<br />Available to order once the shirts are ready.</p></div><DesignShowcase /></section>
    <section className="politics-banner site-shell"><div><p className="store-eyebrow">Introducing Shitty Politics</p><h2>ZERO FAITH.<br />EXCELLENT TASTE.</h2><p>Campaign promises, questionable leadership, and a healthy disrespect for the sales pitch.</p><Link className="store-button" href="/collections/shitty-politics">Meet the candidates ↗</Link></div><div className="politics-seal" aria-hidden="true">SHITTY<br /><span>POLITICS</span><small>APPROVAL RATING: WHO CARES</small></div></section>
    <section className="store-manifesto site-shell"><p className="store-eyebrow">A little about us</p><h2>WE MAKE THE SHIRTS.<br />YOU MAKE IT AWKWARD.</h2><p>Dark humor. Loud graphics. The kind of shirt that says what you were thinking before someone from HR walked in.</p><Link href="/about" className="store-text-link">Our questionable story →</Link></section>
  </main><SiteFooter /></>;
}
