import type { ReactNode } from 'react';
import GarmentLighting from './GarmentLighting';
import GarmentShadow from './GarmentShadow';

type StageBackground = 'black' | 'bone' | 'charcoal' | 'oxblood' | 'transparent';
type StageScale = 'small' | 'medium' | 'large' | 'hero';

interface GarmentStageProps {
  children: ReactNode;
  background?: StageBackground;
  scale?: StageScale;
  className?: string;
  interactive?: boolean;
  shadow?: 'soft' | 'medium' | 'strong' | 'none';
  badge?: string;
}

const BACKGROUND_CLASS: Record<StageBackground, string> = {
  black: 'bg-[radial-gradient(circle_at_66%_20%,#2a2926_0%,#161514_48%,#0d0d0c_100%)]',
  bone: 'bg-[radial-gradient(circle_at_66%_20%,#f3ecdc_0%,#e1d9c9_48%,#cfc5b2_100%)]',
  charcoal: 'bg-[radial-gradient(circle_at_66%_20%,#2d2c2a_0%,#1b1a18_48%,#111110_100%)]',
  oxblood: 'bg-[radial-gradient(circle_at_66%_20%,#63171d_0%,#431116_48%,#210d10_100%)]',
  transparent: 'bg-transparent',
};

const SCALE_CLASS: Record<StageScale, string> = {
  small: 'min-h-[16rem] sm:min-h-[18rem]',
  medium: 'min-h-[18rem] sm:min-h-[22rem] md:min-h-[24rem]',
  large: 'min-h-[20rem] sm:min-h-[24rem] md:min-h-[28rem]',
  hero: 'min-h-[23rem] sm:min-h-[30rem] md:min-h-[34rem] lg:min-h-[38rem]',
};

export default function GarmentStage({
  children,
  background = 'charcoal',
  scale = 'medium',
  className,
  interactive = false,
  shadow = 'medium',
  badge,
}: GarmentStageProps) {
  return (
    <div className={[
      'relative overflow-hidden rounded-[0.7rem] border border-[#f2ecde14]',
      BACKGROUND_CLASS[background],
      SCALE_CLASS[scale],
      interactive ? 'mockup-hover' : '',
      className,
    ].filter(Boolean).join(' ')}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_18%,#f0ebdf_50%,transparent_84%)] opacity-[0.06]" aria-hidden="true" />
      <div className="absolute -left-8 top-[16%] h-36 w-36 rounded-full bg-[#f0ebdf]/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-8 top-[18%] h-40 w-40 rounded-full bg-[#6f1118]/16 blur-3xl" aria-hidden="true" />

      {badge ? (
        <span className="badge absolute top-4 left-4 z-20">{badge}</span>
      ) : null}

      {shadow !== 'none' ? <GarmentShadow intensity={shadow} /> : null}
      <GarmentLighting tone={background === 'transparent' ? 'charcoal' : background} />

      <div className="absolute inset-0 z-10 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
