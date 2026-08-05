interface BrandStampProps {
  variant?: 'light' | 'dark';
  shape?: 'circle' | 'rounded-rect';
  className?: string;
  decorative?: boolean;
}

export default function BrandStamp({
  variant = 'light',
  shape = 'circle',
  className,
  decorative = true,
}: BrandStampProps) {
  const stroke = variant === 'light' ? '#f2ecde' : '#141311';
  const text = variant === 'light' ? '#d4cdbc' : '#2a2825';
  const bg = variant === 'light' ? 'transparent' : 'rgba(20,19,17,0.04)';

  return (
    <svg
      viewBox="0 0 220 220"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={decorative}
      role={decorative ? 'presentation' : 'img'}
    >
      <rect
        x="10"
        y="10"
        width="200"
        height="200"
        rx={shape === 'circle' ? 100 : 20}
        fill={bg}
        stroke={stroke}
        strokeWidth="3"
      />
      <circle cx="110" cy="110" r="72" fill="none" stroke={stroke} strokeOpacity="0.45" strokeWidth="1.5" />
      <text x="110" y="76" textAnchor="middle" fontSize="18" letterSpacing="2.6" fill={text} fontFamily="var(--font-display), Arial, sans-serif">SHITTYTEES</text>
      <text x="110" y="112" textAnchor="middle" fontSize="11" letterSpacing="2.2" fill={text} fontFamily="var(--font-body), Arial, sans-serif">INDEPENDENT APPAREL</text>
      <text x="110" y="142" textAnchor="middle" fontSize="11" letterSpacing="2.1" fill={text} fontFamily="var(--font-body), Arial, sans-serif">EST. 2026</text>
      <path d="M48 110h22M150 110h22" stroke={stroke} strokeOpacity="0.45" strokeWidth="1.5" />
    </svg>
  );
}
