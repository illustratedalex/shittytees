interface LogoMarkProps {
  variant?: 'light' | 'dark';
  size?: number;
  className?: string;
  decorative?: boolean;
  title?: string;
}

export default function LogoMark({
  variant = 'light',
  size = 24,
  className,
  decorative = true,
  title = 'ShittyTees symbol',
}: LogoMarkProps) {
  const stroke = variant === 'light' ? '#f2ecde' : '#141311';
  const fill = variant === 'light' ? '#5b1216' : '#d7c8b0';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden={decorative}
      role={decorative ? 'presentation' : 'img'}
    >
      {!decorative ? <title>{title}</title> : null}
      <rect x="4" y="4" width="56" height="56" rx="14" fill="none" stroke={stroke} strokeWidth="3" />
      <path d="M16 20h32v8H34v20h-8V28H16z" fill={fill} />
      <path d="M18 42h28" stroke={stroke} strokeWidth="4" strokeLinecap="round" />
      <path d="M21 15l22 22" stroke={stroke} strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
