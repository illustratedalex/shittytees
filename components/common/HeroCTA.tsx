import Button from './Button';

interface HeroCTAProps {
  primaryHref: string;
  secondaryHref: string;
  primaryLabel: string;
  secondaryLabel: string;
  className?: string;
}

export default function HeroCTA({
  primaryHref,
  secondaryHref,
  primaryLabel,
  secondaryLabel,
  className,
}: HeroCTAProps) {
  return (
    <div className={['hero-cta', className].filter(Boolean).join(' ')}>
      <Button href={primaryHref} variant="primary" className="w-full sm:w-auto px-8 py-4 shadow-[0_10px_22px_rgba(91,18,22,0.28)]">
        {primaryLabel}
      </Button>
      <Button href={secondaryHref} variant="secondary" className="w-full sm:w-auto px-8 py-4">
        {secondaryLabel}
      </Button>
    </div>
  );
}
