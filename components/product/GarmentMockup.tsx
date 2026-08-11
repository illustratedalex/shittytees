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
  small: 'w-[66%] h-[66%]',
  medium: 'w-[76%] h-[76%]',
  large: 'w-[83%] h-[83%]',
  hero: 'w-[89%] h-[89%]',
};

const ARTWORK_PLACEMENT_CLASS: Record<ArtworkPlacement, string> = {
  center: 'left-1/2 top-[56%] -translate-x-1/2 -translate-y-1/2 w-[40%] max-w-[11rem]',
  'left-chest': 'left-[41%] top-[46%] -translate-x-1/2 -translate-y-1/2 w-[20%] max-w-[6.5rem]',
  'oversized-center': 'left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-[52%] max-w-[14rem]',
  back: 'left-1/2 top-[54%] -translate-x-1/2 -translate-y-1/2 w-[44%] max-w-[12rem]',
  sleeve: 'left-[73%] top-[46%] -translate-x-1/2 -translate-y-1/2 w-[17%] max-w-[5rem]',
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
    'M256 72c-34 0-64 9-93 25l-39 21-37-21-49 64 43 32 32-26 14 268c1 22 20 39 42 39h194c22 0 41-17 42-39l14-268 32 26 43-32-49-64-37 21-39-21c-29-16-59-25-93-25z';
  const backPath =
    'M256 76c-32 0-61 9-89 24l-35 19-39-20-48 61 43 34 30-26 14 265c1 22 19 39 41 39h166c22 0 40-17 41-39l14-265 30 26 43-34-48-61-39 20-35-19c-28-15-57-24-89-24z';

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
          <path d="M170 152l-46-28-32 36 42 30 36-38z" fill={`url(#${shirtRimId})`} opacity="0.84" />
          <path d="M342 152l46-28 32 36-42 30-36-38z" fill={`url(#${shirtRimId})`} opacity="0.84" />

          <path
            d={view === 'front'
              ? 'M256 92c-22 0-42 7-56 19l21 26c8-6 20-9 35-9s27 3 35 9l21-26c-14-12-34-19-56-19z'
              : 'M256 98c-24 0-44 8-60 22l20 22c11-8 24-12 40-12s29 4 40 12l20-22c-16-14-36-22-60-22z'}
            fill="#0f0f0f"
            opacity="0.38"
          />

          <path d="M186 174c-7 36-11 70-11 130" stroke="#000" strokeOpacity="0.16" strokeWidth="3" fill="none" />
          <path d="M326 174c7 36 11 70 11 130" stroke="#000" strokeOpacity="0.16" strokeWidth="3" fill="none" />
          <path d="M132 164c16 10 28 22 32 44" stroke="#000" strokeOpacity="0.14" strokeWidth="2" fill="none" />
          <path d="M380 164c-16 10-28 22-32 44" stroke="#000" strokeOpacity="0.14" strokeWidth="2" fill="none" />

          <path d="M192 198c20 12 42 18 64 18s44-6 64-18" stroke="#fff" strokeOpacity="0.1" strokeWidth="3" fill="none" />
          <path d="M204 220c18 10 34 14 52 14s34-4 52-14" stroke="#fff" strokeOpacity="0.08" strokeWidth="2" fill="none" />
          <path d="M170 430c28 18 62 26 86 26s58-8 86-26" stroke="#000" strokeOpacity="0.2" strokeWidth="2.5" fill="none" />
          <path d="M170 434c28 17 62 25 86 25s58-8 86-25" stroke="#fff" strokeOpacity="0.08" strokeWidth="1.4" fill="none" />

          <path d={view === 'front' ? 'M156 194h200v232H156z' : 'M160 198h192v228H160z'} fill={`url(#${shirtFoldId})`} opacity="0.24" />
          <path d="M202 252c8 26 8 86 0 132" stroke="#fff" strokeOpacity="0.07" strokeWidth="2" fill="none" />
          <path d="M310 252c-8 26-8 86 0 132" stroke="#fff" strokeOpacity="0.07" strokeWidth="2" fill="none" />
          <path d="M256 238v172" stroke="#000" strokeOpacity="0.11" strokeWidth="1.7" fill="none" />
        </svg>

        <div className={`absolute ${artworkPlacementClass}`} style={{ color: palette.artwork }}>
          <GarmentArtwork
            text={artworkText}
            image={artworkSrc}
            className={artworkSrc ? fitClass : 'text-current'}
          />
        </div>
      </div>
    </GarmentStage>
  );
}
