type LightingTone = 'black' | 'bone' | 'charcoal' | 'oxblood';

interface GarmentLightingProps {
  tone?: LightingTone;
  className?: string;
}

const TONE_CLASS: Record<LightingTone, string> = {
  black: 'from-white/12 via-transparent to-black/50',
  bone: 'from-white/24 via-white/6 to-black/28',
  charcoal: 'from-white/16 via-transparent to-black/44',
  oxblood: 'from-[#f2ecde]/12 via-transparent to-black/46',
};

export default function GarmentLighting({ tone = 'charcoal', className }: GarmentLightingProps) {
  return (
    <>
      <div className={['absolute inset-0 bg-gradient-to-b', TONE_CLASS[tone], className].filter(Boolean).join(' ')} aria-hidden="true" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.04)_32%,transparent_60%)]" aria-hidden="true" />
    </>
  );
}
