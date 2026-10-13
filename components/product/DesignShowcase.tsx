import Image from 'next/image';
import { DESIGN_SHOWCASE } from '@/data/designShowcase';

export default function DesignShowcase({ politicsOnly = false }: { politicsOnly?: boolean }) {
  const designs = politicsOnly ? DESIGN_SHOWCASE.filter((design) => design.collection === 'Shitty Politics') : DESIGN_SHOWCASE;
  return <div className="design-grid">{designs.map((design) => <article className="design-card" key={design.slug} id={design.slug}>
    <div className={`design-image ${design.image.endsWith('-art.png') ? 'design-image--art' : ''}`}>
      <Image src={design.image} alt={`${design.name} ${design.image.endsWith('-art.png') ? 'artwork' : 'shirt concept mockup'}`} fill sizes="(max-width: 600px) 90vw, (max-width: 1000px) 44vw, 30vw" className="object-contain" unoptimized />
      <span className="design-status">Coming soon</span>
    </div>
    <div className="design-copy"><p className="store-eyebrow">{design.collection}</p><h3>{design.name}</h3><p>{design.description}</p><details><summary>See the design details</summary><p>Artwork and visual mockup for the next release. Shirt options and final price will appear when this design is ready to order.</p>{design.artwork ? <a href={design.artwork} target="_blank" rel="noreferrer">View full artwork ↗</a> : null}</details></div>
  </article>)}</div>;
}
