import Image from 'next/image';
import type { ProductImage } from '@/lib/products/imageResolver';

interface ProductThumbnailRailProps {
  images: ProductImage[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export default function ProductThumbnailRail({ images, selectedIndex, onSelect }: ProductThumbnailRailProps) {
  if (images.length <= 1) {
    return null;
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-3.5">
      {images.map((image, index) => (
        <button
          key={`${image.url}-${image.role}`}
          type="button"
          onClick={() => onSelect(index)}
          className={[
            'relative min-h-[4.4rem] aspect-square overflow-hidden rounded-[0.2rem] border bg-[#f2e8d5] transition-colors focus-visible-ring',
            selectedIndex === index
              ? 'border-[#0b0b0b] ring-2 ring-[#ff4f9a]'
              : 'border-[#d9d3c8] hover:border-[#ffd75a]',
          ].join(' ')}
          aria-label={`Show ${image.alt}`}
          aria-pressed={selectedIndex === index}
        >
          <Image
            src={image.url}
            alt=""
            fill
            sizes="88px"
            className="object-contain p-2"
            unoptimized
          />
          <span className="sr-only">{image.alt}</span>
        </button>
      ))}
    </div>
  );
}
