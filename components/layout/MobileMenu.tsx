'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { NavigationLink } from '@/data/navigation';

interface MobileMenuProps {
  links: NavigationLink[];
  cartCount: number;
}

export default function MobileMenu({ links, cartCount }: MobileMenuProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-site-menu"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        onClick={() => setOpen((prev) => !prev)}
        className="min-h-[44px] min-w-[44px] px-5 inline-flex items-center justify-center rounded-sm border border-[#5b5244] text-[12px] uppercase tracking-[0.12em] text-[#f2e8d5] hover:text-[#0b0b0b] hover:bg-[#ff4f9a] hover:border-[#ff4f9a] focus-visible-ring"
      >
        {open ? 'Close' : 'Menu'}
      </button>

      {open ? (
        <nav id="mobile-site-menu" className="absolute left-0 right-0 top-full border-t border-[#4e4639] bg-[#0b0b0b] px-5 py-5 shadow-[0_18px_48px_rgba(0,0,0,0.48)]" aria-label="Mobile">
          <div className="h-[2px] w-28 bg-[radial-gradient(circle,_#37d5d6_0,_#37d5d6_25%,_transparent_25%,_transparent_100%)] bg-[length:6px_6px] opacity-65 mb-4" />
          <ul className="flex flex-col gap-2 text-[13px] uppercase tracking-[0.11em] text-[#f2e8d5]">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`min-h-[48px] px-4 rounded-sm hover:text-[#0b0b0b] hover:bg-[#ffd75a] flex items-center focus-visible-ring ${pathname === link.href ? 'text-[#0b0b0b] bg-[#f2e8d5]' : ''}`}
                  aria-current={pathname === link.href ? 'page' : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/cart"
                className={`min-h-[48px] px-4 rounded-sm border border-[#5b5244] hover:border-[#ff4f9a] hover:bg-[#ff4f9a] hover:text-[#0b0b0b] flex items-center justify-between focus-visible-ring ${pathname === '/cart' ? 'text-[#0b0b0b] bg-[#f2e8d5] border-[#f2e8d5]' : ''}`}
                aria-current={pathname === '/cart' ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                <span>Cart</span>
                <span>{cartCount}</span>
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
