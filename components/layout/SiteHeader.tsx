'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/hooks/useCart';
import { NAVIGATION } from '@/data/navigation';
import { Wordmark } from '@/components/brand';
import MobileMenu from './MobileMenu';

interface SiteHeaderProps {
  transparentOnTop?: boolean;
}

export default function SiteHeader({ transparentOnTop = false }: SiteHeaderProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const shellClass = transparentOnTop && !scrolled
    ? 'bg-[#0b0b0be6] border-b border-transparent'
    : 'bg-[#0b0b0bf2] border-b border-[#3a3329]';

  const mainLinks = NAVIGATION.header.filter((link) => link.href !== '/cart');
  const headerLinks = mainLinks.map((link) => link.href === '/drops/drop-001'
    ? { ...link, label: 'Drops' }
    : link);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-colors duration-300 ${shellClass} header-shell`}>
      <div className="site-shell min-h-[4.35rem] flex items-center justify-between gap-4">
        <Link href="/" aria-label="Go to homepage" className="min-h-[44px] inline-flex items-center focus-visible-ring rounded-sm">
          <Wordmark
            variant="light"
            size="display"
            showMark={false}
            className="header-wordmark"
            as="span"
          />
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-[0.8rem] uppercase tracking-[0.11em] text-[#f2e8d5]" aria-label="Primary">
          {headerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`min-h-[44px] px-3.5 inline-flex items-center rounded-sm transition-colors hover:text-[#0b0b0b] hover:bg-[#ffd75a] focus-visible-ring ${pathname === link.href ? 'text-[#0b0b0b] bg-[#f2e8d5]' : ''}`}
              aria-current={pathname === link.href ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className={`min-h-[44px] px-4 inline-flex items-center rounded-sm border text-[0.76rem] uppercase tracking-[0.11em] transition-colors focus-visible-ring ${pathname === '/cart' ? 'text-[#0b0b0b] border-[#f2e8d5] bg-[#f2e8d5]' : 'text-[#f2e8d5] border-[#5b5244] hover:border-[#ffd75a] hover:text-[#0b0b0b] hover:bg-[#ffd75a]'}`}
            aria-current={pathname === '/cart' ? 'page' : undefined}
          >
            Cart ({itemCount})
          </Link>
          <MobileMenu links={headerLinks} cartCount={itemCount} />
        </div>
      </div>
    </header>
  );
}
