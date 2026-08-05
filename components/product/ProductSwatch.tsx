interface ProductSwatchProps {
  name: string;
  hex: string;
  selected?: boolean;
  className?: string;
}

export default function ProductSwatch({ name, hex, selected = false, className }: ProductSwatchProps) {
  return (
    <span
      title={name}
      aria-label={name}
      className={[
        'inline-flex h-6 w-6 rounded-full border',
        selected ? 'border-[#f2ecde] ring-2 ring-[#f2ecde55]' : 'border-[#f2ecde44]',
        className,
      ].filter(Boolean).join(' ')}
      style={{ background: hex }}
    />
  );
}
