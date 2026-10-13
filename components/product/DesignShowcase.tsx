import Image from 'next/image';
import Link from 'next/link';
import { DESIGN_SHOWCASE } from '@/data/designShowcase';

export default function DesignShowcase({ politicsOnly = false }: { politicsOnly?: boolean }) {
  const designs = politicsOnly ? DESIGN_SHOWCASE.filter((design) => design.collection === 'Shitty Politics') : DESIGN_SHOWCASE;
  return <div className="design-grid">{designs.map((design) => <article className="design-card" key={design.slug} id={design.slug}>
    <div className={`design-image ${design.image.endsWith('-art.png') ? 'design-image--art' : ''}`}>
      <Image src={design.image} alt={`${design.name} ${design.image.endsWith('-art.png') ? 'artwork' : 'shirt mockup'}`} fill sizes="(max-width: 600px) 90vw, (max-width: 1000px) 44vw, 30vw" className="object-contain" unoptimized />
      <span className="design-status">{design.collection==='Shitty Politics'?'Shitty Politics':'Coming soon'}</span>
    </div>
    <div className="design-copy"><p className="store-eyebrow">{design.collection}</p><h3>{design.collection === 'Shitty Politics' ? <Link href={'/designs/' + design.slug}>{design.name}</Link> : design.name}</h3><p>{design.description}</p>{design.collection === 'Shitty Politics' ? <Link href={'/designs/' + design.slug} className="underline inline-block my-4">View shirt →</Link> : null}<details><summary>See the design details</summary><p>{design.collection === 'Shitty Politics' ? 'Official Printful shirt mockup. Choose your size and get a destination quote on the product page.' : 'Artwork and visual mockup for the next release. Shirt options and final price will appear when this design is ready to order.'}</p>{design.artwork ? <a href={design.artwork} target="_blank" rel="noreferrer">View full artwork ↗</a> : null}</details></div>
  </article>)}</div>;
}
