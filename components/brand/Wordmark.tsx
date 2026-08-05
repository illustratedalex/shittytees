import type { ReactNode } from 'react';

export type WordmarkProps = {
  variant?: 'light' | 'dark';
  size?: 'compact' | 'standard' | 'display';
  className?: string;
  showMark?: boolean;
  as?: 'span' | 'div' | 'h1' | 'p';
};

const SIZE_CLASS: Record<NonNullable<WordmarkProps['size']>, string> = {
  compact: 'text-[0.74rem] tracking-[0.19em]',
  standard: 'text-[0.95rem] tracking-[0.2em]',
  display: 'text-[1.4rem] sm:text-[1.9rem] md:text-[2.4rem] tracking-[0.1em]',
};

const TONE_CLASS: Record<NonNullable<WordmarkProps['variant']>, string> = {
  light: 'text-[#f2ecde]',
  dark: 'text-[#141311]',
};

function Wrapper({ as, className, children }: { as: NonNullable<WordmarkProps['as']>; className: string; children: ReactNode }) {
  if (as === 'div') return <div className={className}>{children}</div>;
  if (as === 'h1') return <h1 className={className}>{children}</h1>;
  if (as === 'p') return <p className={className}>{children}</p>;
  return <span className={className}>{children}</span>;
}

export default function Wordmark({
  variant = 'light',
  size = 'standard',
  className,
  showMark = true,
  as = 'span',
}: WordmarkProps) {
  return (
    <Wrapper
      as={as}
      className={[
        'wordmark inline-flex items-center uppercase font-bold leading-none',
        SIZE_CLASS[size],
        TONE_CLASS[variant],
        className,
      ].filter(Boolean).join(' ')}
    >
      <span aria-label="ShittyTees">ShittyTees</span>
      {showMark ? <span className="wordmark-mark" aria-hidden="true">/</span> : null}
    </Wrapper>
  );
}
