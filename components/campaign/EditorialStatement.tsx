interface EditorialStatementProps {
  text: string;
  className?: string;
}

export default function EditorialStatement({ text, className }: EditorialStatementProps) {
  return (
    <section className={['bg-[#f0ebdf] py-14 sm:py-16 lg:py-18', className].filter(Boolean).join(' ')}>
      <div className="max-w-[84rem] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="w-8 h-[2px] bg-[#6f1118] mb-5"></div>
        <p className="text-[#121110] text-[1.15rem] sm:text-[1.45rem] md:text-[1.8rem] lg:text-[2.2rem] leading-[1.25] max-w-4xl text-balance">
          {text}
        </p>
      </div>
    </section>
  );
}
