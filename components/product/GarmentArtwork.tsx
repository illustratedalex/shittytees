interface GarmentArtworkProps {
  text?: string;
  image?: string;
  className?: string;
}

function linesFromText(text: string): string[] {
  const words = text
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length <= 2) return [words.join(' ')];
  return [words.slice(0, 2).join(' '), words.slice(2, 5).join(' ')];
}

export default function GarmentArtwork({ text, image, className }: GarmentArtworkProps) {
  if (image) {
    return <img src={image} alt="Garment artwork" className={['w-[58%] h-[58%] object-contain', className].filter(Boolean).join(' ')} />;
  }

  if (!text) return null;
  const lines = linesFromText(text);

  return (
    <div className={['text-center uppercase', className].filter(Boolean).join(' ')} aria-hidden="true">
      {lines.map((line, index) => (
        <p
          key={`${line}-${index}`}
          className="font-semibold tracking-[0.12em] leading-tight text-[0.74rem] sm:text-[0.8rem]"
        >
          {line}
        </p>
      ))}
    </div>
  );
}
