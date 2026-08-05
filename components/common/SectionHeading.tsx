import type { ReactNode } from 'react';

type SectionHeadingAlign = 'left' | 'center';

interface SectionHeadingProps {
  kicker?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: SectionHeadingAlign;
  headingLevel?: 'h1' | 'h2';
  className?: string;
  titleClassName?: string;
}

export default function SectionHeading({
  kicker,
  title,
  description,
  align = 'left',
  headingLevel = 'h2',
  className,
  titleClassName,
}: SectionHeadingProps) {
  const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left';
  const titleClasses = ['type-heading-lg text-[#f0ebdf]', titleClassName].filter(Boolean).join(' ');

  return (
    <div className={['section-heading', alignClass, className].filter(Boolean).join(' ')}>
      {kicker ? <p className="section-kicker">{kicker}</p> : null}
      {headingLevel === 'h1' ? <h1 className={titleClasses}>{title}</h1> : <h2 className={titleClasses}>{title}</h2>}
      {description ? <p className="text-sm sm:text-base text-[#bfb39d] max-w-3xl">{description}</p> : null}
      <div className="section-rule" aria-hidden="true"></div>
    </div>
  );
}
