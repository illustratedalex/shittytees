interface SectionDividerProps {
  className?: string;
}

export default function SectionDivider({ className }: SectionDividerProps) {
  return <div className={['section-divider', className].filter(Boolean).join(' ')} aria-hidden="true" />;
}
