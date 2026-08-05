import type { ReactNode } from 'react';

interface DropSectionProps {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: 'black' | 'charcoal' | 'bone';
}

const TONE_CLASS = {
  black: 'bg-[#0f0f0f]',
  charcoal: 'bg-[#1b1b1b]',
  bone: 'bg-[#f0ebdf] text-[#121110]',
} as const;

export default function DropSection({ id, children, className, tone = 'black' }: DropSectionProps) {
  return (
    <section id={id} className={[TONE_CLASS[tone], 'py-16 sm:py-20 lg:py-24', className].filter(Boolean).join(' ')}>
      <div className="max-w-[96rem] mx-auto px-5 sm:px-8 lg:px-12">{children}</div>
    </section>
  );
}
