interface GarmentShadowProps {
  className?: string;
  intensity?: 'soft' | 'medium' | 'strong';
}

const INTENSITY_CLASS = {
  soft: 'opacity-45 blur-xl',
  medium: 'opacity-58 blur-2xl',
  strong: 'opacity-70 blur-3xl',
} as const;

export default function GarmentShadow({ className, intensity = 'medium' }: GarmentShadowProps) {
  return (
    <div
      className={[
        'absolute left-[16%] right-[16%] bottom-[7%] h-[13%] rounded-full bg-black',
        INTENSITY_CLASS[intensity],
        className,
      ].filter(Boolean).join(' ')}
      aria-hidden="true"
    />
  );
}
