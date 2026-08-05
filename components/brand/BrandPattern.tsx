interface BrandPatternProps {
  variant?: 'light' | 'dark';
  className?: string;
  decorative?: boolean;
}

export default function BrandPattern({ variant = 'light', className, decorative = true }: BrandPatternProps) {
  const stroke = variant === 'light' ? 'rgba(242,236,222,0.14)' : 'rgba(20,19,17,0.16)';
  const fill = variant === 'light' ? 'rgba(242,236,222,0.06)' : 'rgba(20,19,17,0.08)';

  return (
    <svg
      viewBox="0 0 240 240"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={className}
      aria-hidden={decorative}
      role={decorative ? 'presentation' : 'img'}
    >
      <defs>
        <pattern id="st-pattern-grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M0 0H60V60" fill="none" stroke={stroke} strokeWidth="0.8" />
          <path d="M15 30h12M33 30h12" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M30 15v10M30 35v10" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
          <path d="M20 20l20 20" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
          <circle cx="30" cy="30" r="1.2" fill={fill} />
          <path d="M10 10l4 4M10 14l4-4" stroke={stroke} strokeWidth="0.8" strokeLinecap="round" opacity="0.75" />
        </pattern>
      </defs>
      <rect width="240" height="240" fill="url(#st-pattern-grid)" />
    </svg>
  );
}
