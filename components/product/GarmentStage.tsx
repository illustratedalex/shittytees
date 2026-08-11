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
  black: 'bg-[radial-gradient(circle_at_68%_20%,#2c2a27_0%,#1a1816_46%,#0f0f0e_100%)]',
  bone: 'bg-[radial-gradient(circle_at_68%_20%,#f3ecdc_0%,#dfd6c7_46%,#ccc0ad_100%)]',
  charcoal: 'bg-[radial-gradient(circle_at_68%_20%,#312f2d_0%,#1f1d1b_46%,#131311_100%)]',
  oxblood: 'bg-[radial-gradient(circle_at_68%_20%,#672127_0%,#48171c_46%,#231013_100%)]',
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
      'relative overflow-hidden rounded-[0.7rem] border border-[#f2ecde12]',
      BACKGROUND_CLASS[background],
      SCALE_CLASS[scale],
      interactive ? 'mockup-hover' : '',
      className,
    ].filter(Boolean).join(' ')}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_16%,#f0ebdf_50%,transparent_86%)] opacity-[0.05]" aria-hidden="true" />
      <div className="absolute -left-8 top-[16%] h-36 w-36 rounded-full bg-[#f0ebdf]/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-8 top-[18%] h-40 w-40 rounded-full bg-[#6f1118]/14 blur-3xl" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-[0.09] mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' /%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.48'/%3E%3C/svg%3E\")",
        }}
      />

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
