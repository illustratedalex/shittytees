import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { DESIGN_SHOWCASE } from '@/data/designShowcase';
import { SiteFooter, SiteHeader } from '@/components/layout';
type Props = { params: Promise<{ slug: string }> };
function findDesign(slug: string) { return DESIGN_SHOWCASE.find(d => d.slug === slug && d.collection === 'Shitty Politics'); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
 const design = findDesign((await params).slug);
 return { title: design ? design.name + ' | Shitty Tees' : 'Design not found', description: design?.description };
}
export default async function PoliticsDesignPage({ params }: Props) {
 const design = findDesign((await params).slug);
 if (!design) notFound();
 return <><SiteHeader /><main className="storefront"><section className="store-section site-shell">
 <Link href="/collections/shitty-politics" className="underline">← Shitty Politics</Link>
 <div className="grid gap-8 md:grid-cols-2 mt-8">
 <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-[#171717]"><Image src={design.image} alt={design.name + ' black shirt concept mockup'} fill sizes="(max-width: 768px) 90vw, 45vw" className="object-contain" unoptimized /></div>
 <div><p className="store-eyebrow">Shitty Politics</p><h1 className="text-4xl md:text-5xl font-bold my-5">{design.name}</h1><p className="store-page-description">{design.description}</p>
 <div className="my-8 border-y border-white/20 py-6"><h2 className="text-xl font-bold">The shirt</h2><p className="mt-3">Bella + Canvas 3001 unisex tee · Black</p><p className="mt-2">Planned sizes: S, M, L, XL</p></div>
 <p className="store-eyebrow">Coming soon</p><p className="mt-3 mb-6">We’re finishing the print setup. Ordering and final pricing will open when this shirt is ready.</p>
 <Link className="btn btn--primary" href="/collections/shitty-politics">See both designs</Link>
 </div></div>
 <section className="mt-16"><h2 className="text-2xl font-bold mb-5">The artwork</h2><div className="relative aspect-[4/5] max-w-lg bg-[#171717] rounded-2xl"><Image src={design.artwork} alt={design.name + ' original artwork'} fill sizes="(max-width: 600px) 90vw, 512px" className="object-contain p-5" unoptimized /></div></section>
 </section></main><SiteFooter /></>;
}
