'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { NAVIGATION } from '@/data/navigation';
import { LogoLockup } from '@/components/brand';
import MobileMenu from './MobileMenu';

interface SiteHeaderProps {
  transparentOnTop?: boolean;
}

export default function SiteHeader({ transparentOnTop = false }: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const shellClass = transparentOnTop && !scrolled
    ? 'bg-transparent border-b border-transparent'
    : 'bg-[#0a0a0a]/96 border-b border-[#1f1f1f]';

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${shellClass}`}>
      <div className="max-w-[96rem] mx-auto px-5 sm:px-8 lg:px-12 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Go to homepage">
          <LogoLockup variant="light" layout="compact" />
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-[11px] uppercase tracking-[0.17em] text-[#c7baa4]">
          {NAVIGATION.header.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#f0ebdf]">
              {link.label}
            </Link>
          ))}
        </nav>

        <MobileMenu links={NAVIGATION.header} />
      </div>
    </header>
  );
}
