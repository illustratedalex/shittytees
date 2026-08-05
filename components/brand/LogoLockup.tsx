import type { ReactNode } from 'react';
import LogoMark from './LogoMark';
import Wordmark from './Wordmark';

type LockupLayout = 'horizontal' | 'stacked' | 'compact';

interface LogoLockupProps {
  variant?: 'light' | 'dark';
  layout?: LockupLayout;
  className?: string;
  showWordmarkMark?: boolean;
}

const MARK_SIZE: Record<LockupLayout, number> = {
  horizontal: 24,
  stacked: 28,
  compact: 20,
};

function Wrapper({ className, children }: { className?: string; children: ReactNode }) {
  return <span className={className}>{children}</span>;
}

export default function LogoLockup({
  variant = 'light',
  layout = 'horizontal',
  className,
  showWordmarkMark = true,
}: LogoLockupProps) {
  const baseClass = layout === 'stacked'
    ? 'inline-flex flex-col items-start gap-2'
    : 'inline-flex items-center';
  const gapClass = layout === 'compact' ? 'gap-2' : 'gap-3';

  return (
    <Wrapper className={[baseClass, gapClass, className].filter(Boolean).join(' ')}>
      <LogoMark variant={variant} size={MARK_SIZE[layout]} decorative />
      <Wordmark
        variant={variant}
        size={layout === 'compact' ? 'compact' : 'standard'}
        showMark={showWordmarkMark}
      />
    </Wrapper>
  );
}
