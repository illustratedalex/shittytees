import Image from 'next/image';
import type { ResolvedProductImage } from '@/lib/products/imageResolver';

interface ProductImageStageProps {
  image: ResolvedProductImage;
  aspect?: 'square' | '4/5';
  className?: string;
  priority?: boolean;
  sizes?: string;
}

const ASPECT_CLASS: Record<NonNullable<ProductImageStageProps['aspect']>, string> = {
  square: 'aspect-square',
  '4/5': 'aspect-[4/5]',
};

export default function ProductImageStage({
  image,
  aspect = '4/5',
  className,
  priority = false,
  sizes = '(max-width: 768px) 92vw, (max-width: 1280px) 46vw, 560px',
}: ProductImageStageProps) {
  return (
    <div className={['product-image-stage', ASPECT_CLASS[aspect], className].filter(Boolean).join(' ')}>
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes={sizes}
        className="h-full w-full object-contain"
        unoptimized
        priority={priority}
      />
      {image.isPreview ? <span className="product-image-preview-tag">Preview</span> : null}
    </div>
  );
}
