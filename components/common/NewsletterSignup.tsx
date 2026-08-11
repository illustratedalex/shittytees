'use client';

import type { FormEvent } from 'react';
import Button from './Button';

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
    <section className={['bg-[#1b1b1b] rounded-2xl border border-[#2f2f2f] p-6 sm:p-10', className].filter(Boolean).join(' ')}>
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-[0.78rem] uppercase tracking-[0.12em] text-[#aaa59c]">Newsletter</p>
        <h2 className="normal-case text-[1.9rem] sm:text-[2.3rem] mt-2 text-[#f3efe6]">{title}</h2>
        <p className="text-[#d5d0c6] mt-3">{description}</p>
        <form className="mt-7 flex flex-col sm:flex-row gap-3.5 items-end" onSubmit={handleSubmit}>
          <div className="flex-1 text-left">
            <label htmlFor="newsletter-email" className="block text-[11px] uppercase tracking-[0.16em] text-[#d5d0c6] mb-2">
              Email Address
            </label>
            <input
              id="newsletter-email"
              name="email"
              type="email"
              required
              placeholder="you@email.com"
              className="w-full min-h-[52px] px-4 py-3.5 bg-[#f3efe6] text-[#111111] placeholder-[#666058] border border-[#c8c2b8] rounded-md focus:outline-none focus:border-[#7f1d1d]"
            />
          </div>
          <Button type="submit" variant="primary" className="w-full sm:w-auto px-7 py-4">
            {buttonText}
          </Button>
        </form>
      </div>
    </section>
  );
}
