'use client';

import type { FormEvent } from 'react';
import Button from './Button';
import SectionHeading from './SectionHeading';

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  buttonText?: string;
  onSubmit?: (email: string) => void;
  className?: string;
}

export default function NewsletterSignup({
  title = 'Join the bad influence.',
  description = 'New drops, limited runs, and occasional terrible decisions.',
  buttonText = 'Subscribe',
  onSubmit,
  className,
}: NewsletterSignupProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const emailValue = formData.get('email');
    if (typeof emailValue === 'string' && emailValue.trim().length > 0) {
      onSubmit?.(emailValue.trim());
    }
  };

  return (
    <section className={['newsletter-shell', className].filter(Boolean).join(' ')}>
      <SectionHeading
        align="center"
        title={title}
        description={description}
        titleClassName="normal-case tracking-[-0.01em]"
      />
      <form className="mt-6 flex flex-col sm:flex-row gap-3" onSubmit={handleSubmit}>
        <div className="flex-1 text-left">
          <label htmlFor="newsletter-email" className="block text-[11px] uppercase tracking-[0.16em] text-[#bdb19b] mb-2">
            Email Address
          </label>
          <input
            id="newsletter-email"
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className="w-full px-4 py-3.5 bg-[#161616] text-[#f0ebdf] placeholder-[#8e8e86] border border-transparent focus:outline-none focus:border-[#6f1118]"
          />
        </div>
        <Button type="submit" variant="primary" className="sm:self-end px-7 py-3.5">
          {buttonText}
        </Button>
      </form>
    </section>
  );
}
