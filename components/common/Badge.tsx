import type { ReactNode } from 'react';

type BadgeTone = 'default' | 'soft';

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export default function Badge({ children, tone = 'default', className }: BadgeProps) {
  const toneClass = tone === 'soft' ? 'badge--soft' : '';
  return <span className={['badge', toneClass, className].filter(Boolean).join(' ')}>{children}</span>;
}
