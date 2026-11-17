import type {Metadata} from 'next';
import Link from 'next/link';
import {SHITTY_COLLECTIONS} from '@/data/shittyCollections';
import {getPublicProducts} from '@/lib/catalog/service';
import {resolveProductImage} from '@/lib/products/imageResolver';
import ProductImageStage from '@/components/product/ProductImageStage';
import {SiteFooter,SiteHeader} from '@/components/layout';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Shitty Collections | Shitty Tees',description:'One terrible family. Politics, childhoods, cars, housing, jobs, relationships, and decisions. All part of Shitty Tees.',alternates:{canonical:'/collections'}};
export default async function CollectionsPage(){
 const products=await getPublicProducts();
 return <><SiteHeader/><main className="storefront"><section className="store-section site-shell"><p className="store-eyebrow">One brand. Many ways to be shitty.</p><h1 className="store-page-title">THE SHITTY FAMILY.</h1><p className="store-page-description">Every collection is part of Shitty Tees. Pick your particular problem.</p><div className="shitty-collection-grid">{SHITTY_COLLECTIONS.map(c=>{const group=products.filter(p=>p.collectionSlug===c.slug);const image=group[0]?resolveProductImage(group[0]):undefined;return <article className="shitty-collection-card" key={c.slug}><Link href={'/collections/'+c.slug}>{image?<ProductImageStage image={image}/>:null}<p className="store-eyebrow">A Shitty Tees collection</p><h2>{c.name}</h2><p>{c.description}</p><span className="store-text-link">{group.length?'Shop the '+group.length+' shirts':'See the collection'} →</span></Link></article>;})}</div><Link href="/collections/archive" className="store-text-link inline-block mt-8">Explore the archive →</Link></section></main><SiteFooter/></>;
}
