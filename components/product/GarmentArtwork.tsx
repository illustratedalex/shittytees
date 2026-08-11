interface GarmentArtworkProps {
  text?: string;
  image?: string;
  className?: string;
}

function linesFromText(text: string): string[] {
  const words = text
    .toUpperCase()
    .replace(/[^A-Z0-9\s&/-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return [];
  if (words.length <= 2) return [words.join(' ')];

  const compact = words.join(' ');
  if (compact.length <= 17) return [compact];

  const firstLine = words.slice(0, 2).join(' ');
  const secondLine = words.slice(2, 5).join(' ');
  return secondLine ? [firstLine, secondLine] : [firstLine];
}

function BrandMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-14 w-14 opacity-70" aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="14" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M16 20h32v8H34v20h-8V28H16z" fill="currentColor" opacity="0.8" />
      <path d="M18 42h28" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export default function GarmentArtwork({ text, image, className }: GarmentArtworkProps) {
  if (image) {
    return <img src={image} alt="Garment artwork" className={['w-[58%] h-[58%] object-contain', className].filter(Boolean).join(' ')} />;
  }

  if (!text) {
    return (
      <div className={['flex items-center justify-center', className].filter(Boolean).join(' ')} aria-hidden="true">
        <BrandMark />
      </div>
    );
  }

  const lines = linesFromText(text);

  if (lines.length === 0) {
    return (
      <div className={['flex items-center justify-center', className].filter(Boolean).join(' ')} aria-hidden="true">
        <BrandMark />
      </div>
    );
  }

  return (
    <div className={['text-center uppercase', className].filter(Boolean).join(' ')} aria-hidden="true">
      {lines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className="font-semibold tracking-[0.11em] leading-tight text-[0.64rem] sm:text-[0.74rem]"
        >
          {line}
        </p>
      ))}
    </div>
  );
}
