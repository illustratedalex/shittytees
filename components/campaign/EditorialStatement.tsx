interface EditorialStatementProps {
  text: string;
  className?: string;
}

export default function EditorialStatement({ text, className }: EditorialStatementProps) {
  return (
    <section className={['bg-[#f0ebdf] py-16 sm:py-20 lg:py-24', className].filter(Boolean).join(' ')}>
      <div className="max-w-[86rem] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="w-8 h-[2px] bg-[#6f1118] mb-6"></div>
        <p className="text-[#0a0a0a] text-[1.7rem] sm:text-[2.55rem] md:text-[3.35rem] lg:text-[4.25rem] leading-[1.04] max-w-5xl">
          {text}
        </p>
      </div>
    </section>
  );
}
