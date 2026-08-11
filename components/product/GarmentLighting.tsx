type LightingTone = 'black' | 'bone' | 'charcoal' | 'oxblood';

interface GarmentLightingProps {
  tone?: LightingTone;
  className?: string;
}

const TONE_CLASS: Record<LightingTone, string> = {
  black: 'from-white/16 via-transparent to-black/44',
  bone: 'from-white/28 via-white/10 to-black/22',
  charcoal: 'from-white/20 via-transparent to-black/40',
  oxblood: 'from-[#f2ecde]/16 via-transparent to-black/42',
};

export default function GarmentLighting({ tone = 'charcoal', className }: GarmentLightingProps) {
  return (
    <>
      <div className={['absolute inset-0 bg-gradient-to-b', TONE_CLASS[tone], className].filter(Boolean).join(' ')} aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_16%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0.04)_30%,transparent_62%)]" aria-hidden="true" />
      <div className="absolute inset-0 bg-[linear-gradient(118deg,rgba(255,255,255,0.06)_6%,transparent_26%,transparent_64%,rgba(0,0,0,0.18)_100%)]" aria-hidden="true" />
    </>
  );
}
