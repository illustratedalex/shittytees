import { useId } from 'react';
import GarmentArtwork from './GarmentArtwork';
import GarmentStage from './GarmentStage';

export type GarmentColor =
  | 'black'
  | 'bone'
  | 'charcoal'
  | 'white'
  | 'oxblood';

export type ArtworkPlacement =
  | 'center'
  | 'left-chest'
  | 'oversized-center'
  | 'back'
  | 'sleeve';

type GarmentBackground = 'black' | 'bone' | 'charcoal' | 'oxblood' | 'transparent';
type GarmentScale = 'small' | 'medium' | 'large' | 'hero';
type GarmentView = 'front' | 'back';

export type GarmentMockupProps = {
  color?: GarmentColor;
  artworkText?: string;
  artworkImage?: string;
  artworkPlacement?: ArtworkPlacement;
  background?: GarmentBackground;
  scale?: GarmentScale;
  rotation?: number;
  badge?: string;
  className?: string;
  priority?: boolean;
  view?: GarmentView;
  interactive?: boolean;
  decorative?: boolean;
  ariaLabel?: string;

  /* Legacy compatibility props */
  garmentColor?: string;
  backgroundTone?: 'ink' | 'charcoal' | 'bone';
  rotationDeg?: number;
  imageSrc?: string;
  imageAlt?: string;
  garmentFit?: 'contain' | 'cover';
};

type Palette = {
  base: string;
  top: string;
  bottom: string;
  rim: string;
  artwork: string;
};

const PALETTE: Record<GarmentColor, Palette> = {
  black: {
    base: '#171615',
    top: '#2d2b29',
    bottom: '#101010',
    rim: '#3a3632',
    artwork: '#f2ecde',
  },
  bone: {
    base: '#e7decc',
    top: '#f2ead8',
    bottom: '#cfc3ad',
    rim: '#beb39f',
    artwork: '#1b1917',
  },
  charcoal: {
    base: '#30363b',
    top: '#475158',
    bottom: '#22272b',
    rim: '#626c72',
    artwork: '#f2ecde',
  },
  white: {
    base: '#f6f4ef',
    top: '#ffffff',
    bottom: '#ddd6c9',
    rim: '#cbc3b5',
    artwork: '#141311',
  },
  oxblood: {
    base: '#5c1318',
    top: '#7b2128',
    bottom: '#441015',
    rim: '#9c3a42',
    artwork: '#f2ecde',
  },
};

const SCALE_CLASS: Record<GarmentScale, string> = {
  small: 'w-[68%] h-[68%]',
  medium: 'w-[78%] h-[78%]',
  large: 'w-[84%] h-[84%]',
  hero: 'w-[90%] h-[90%]',
};

const ARTWORK_PLACEMENT_CLASS: Record<ArtworkPlacement, string> = {
  center: 'left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[46%]',
  'left-chest': 'left-[42%] top-[46%] -translate-x-1/2 -translate-y-1/2 w-[24%]',
  'oversized-center': 'left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[58%]',
  back: 'left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 w-[50%]',
  sleeve: 'left-[74%] top-[46%] -translate-x-1/2 -translate-y-1/2 w-[20%]',
};

function resolveColor(color?: GarmentColor, legacyHex?: string): GarmentColor {
  if (color) return color;
  const normalized = (legacyHex || '').toLowerCase();
  if (normalized === '#f5f5dc') return 'bone';
  if (normalized === '#ffffff') return 'white';
  if (normalized === '#36454f') return 'charcoal';
  if (normalized === '#800000') return 'oxblood';
  return 'black';
}

function resolveBackground(
  background?: GarmentBackground,
  legacyBackgroundTone?: 'ink' | 'charcoal' | 'bone',
): GarmentBackground {
  if (background) return background;
  if (!legacyBackgroundTone) return 'charcoal';
  if (legacyBackgroundTone === 'ink') return 'black';
  return legacyBackgroundTone;
}

function resolveScale(scale?: GarmentScale, legacyScale?: number): GarmentScale {
  if (scale) return scale;
  if (!legacyScale) return 'medium';
  if (legacyScale >= 1.12) return 'hero';
  if (legacyScale >= 1.06) return 'large';
  if (legacyScale <= 0.95) return 'small';
  return 'medium';
}

export default function GarmentMockup({
  color,
  artworkText,
  artworkImage,
  artworkPlacement = 'center',
  background,
  scale,
  rotation = 0,
  badge,
  className,
  priority,
  view = 'front',
  interactive = false,
  decorative = true,
  ariaLabel,
  garmentColor,
  backgroundTone,
  rotationDeg,
  imageSrc,
  imageAlt,
  garmentFit,
}: GarmentMockupProps) {
  const gradientIdPrefix = useId().replace(/:/g, '');
  const shirtBodyId = `${gradientIdPrefix}-shirt-body`;
  const shirtRimId = `${gradientIdPrefix}-shirt-rim`;
  const shirtFoldId = `${gradientIdPrefix}-shirt-fold`;

  const resolvedColor = resolveColor(color, garmentColor);
  const resolvedBackground = resolveBackground(background, backgroundTone);
  const resolvedScale = resolveScale(scale, typeof scale === 'undefined' ? undefined : undefined);
  const resolvedRotation = typeof rotationDeg === 'number' ? rotationDeg : rotation;
  const palette = PALETTE[resolvedColor];
  const artworkSrc = artworkImage || imageSrc;
  const fitClass = garmentFit === 'cover' ? 'object-cover' : 'object-contain';

  const frontPath =
    'M256 76c-31 0-58 8-84 22l-38 20-38-24-52 66 46 34 30-28 10 270h252l10-270 30 28 46-34-52-66-38 24-38-20c-26-14-53-22-84-22z';
  const backPath =
    'M256 80c-30 0-56 8-82 22l-36 18-40-22-50 62 44 34 30-28 12 266h244l12-266 30 28 44-34-50-62-40 22-36-18c-26-14-52-22-82-22z';

  const artworkPlacementClass = ARTWORK_PLACEMENT_CLASS[
    view === 'back' && artworkPlacement === 'center' ? 'back' : artworkPlacement
  ];

  return (
    <GarmentStage
      background={resolvedBackground}
      scale={resolvedScale}
      badge={badge}
      className={className}
      interactive={interactive}
      shadow={priority ? 'strong' : 'medium'}
    >
      <div
        className={['mockup-garment', SCALE_CLASS[resolvedScale]].join(' ')}
        style={{ transform: `rotate(${resolvedRotation}deg)` }}
      >
        <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" aria-hidden={decorative} role={decorative ? 'presentation' : 'img'}>
          {!decorative ? <title>{ariaLabel || imageAlt || 'Garment mockup'}</title> : null}
          <defs>
            <linearGradient id={shirtBodyId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.top} />
              <stop offset="58%" stopColor={palette.base} />
              <stop offset="100%" stopColor={palette.bottom} />
            </linearGradient>
            <linearGradient id={shirtRimId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={palette.rim} stopOpacity="0.55" />
              <stop offset="100%" stopColor={palette.bottom} stopOpacity="0.78" />
            </linearGradient>
            <linearGradient id={shirtFoldId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
            </linearGradient>
          </defs>

          <path d={view === 'front' ? frontPath : backPath} fill={`url(#${shirtBodyId})`} />
          <path d="M164 154l-44-28-30 34 40 30 34-36z" fill={`url(#${shirtRimId})`} opacity="0.84" />
          <path d="M348 154l44-28 30 34-40 30-34-36z" fill={`url(#${shirtRimId})`} opacity="0.84" />

          <path
            d={view === 'front'
              ? 'M256 96c-20 0-38 6-52 16l20 26c9-5 18-9 32-9s23 4 32 9l20-26c-14-10-32-16-52-16z'
              : 'M256 102c-22 0-40 7-54 20l18 20c10-8 22-12 36-12s26 4 36 12l18-20c-14-13-32-20-54-20z'}
            fill="#0f0f0f"
            opacity="0.42"
          />

          <path d="M182 172c-6 34-10 72-10 132" stroke="#000" strokeOpacity="0.14" strokeWidth="3" fill="none" />
          <path d="M330 172c6 34 10 72 10 132" stroke="#000" strokeOpacity="0.14" strokeWidth="3" fill="none" />

          <path d="M192 198c20 12 42 18 64 18s44-6 64-18" stroke="#fff" strokeOpacity="0.11" strokeWidth="3" fill="none" />
          <path d="M204 220c18 10 34 14 52 14s34-4 52-14" stroke="#fff" strokeOpacity="0.08" strokeWidth="2" fill="none" />

          <path d={view === 'front' ? 'M156 198h200v222H156z' : 'M160 202h192v216H160z'} fill={`url(#${shirtFoldId})`} opacity="0.22" />
        </svg>

        {artworkSrc ? (
          <img src={artworkSrc} alt={imageAlt || 'Garment artwork'} className={`absolute ${artworkPlacementClass} ${fitClass}`} />
        ) : (
          <div className={`absolute ${artworkPlacementClass}`} style={{ color: palette.artwork }}>
            <GarmentArtwork text={artworkText} className="text-current" />
          </div>
        )}
      </div>
    </GarmentStage>
  );
}
