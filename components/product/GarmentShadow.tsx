interface GarmentShadowProps {
  className?: string;
  intensity?: 'soft' | 'medium' | 'strong';
}

const INTENSITY_CLASS = {
  soft: 'opacity-38 blur-2xl',
  medium: 'opacity-48 blur-[34px]',
  strong: 'opacity-58 blur-[42px]',
} as const;

export default function GarmentShadow({ className, intensity = 'medium' }: GarmentShadowProps) {
  return (
    <div
      className={[
        'absolute left-[19%] right-[19%] bottom-[6%] h-[11%] rounded-full bg-black',
        INTENSITY_CLASS[intensity],
        className,
      ].filter(Boolean).join(' ')}
      aria-hidden="true"
    />
  );
}
