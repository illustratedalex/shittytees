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
    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4">
      {images.map((image, index) => (
        <button
          key={`${image.url}-${image.role}`}
          type="button"
          onClick={() => onSelect(index)}
          className={[
            'relative min-h-[4.4rem] aspect-square overflow-hidden rounded-[0.7rem] border bg-[#f0ece3] transition-colors focus-visible-ring',
            selectedIndex === index
              ? 'border-[#111111] ring-1 ring-[#111111]'
              : 'border-[#d9d3c8] hover:border-[#aaa59c]',
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
