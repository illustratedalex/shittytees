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
        className="min-h-[44px] min-w-[44px] px-5 inline-flex items-center justify-center rounded-md border border-[#3a3a3a] text-[12px] uppercase tracking-[0.12em] text-[#f3efe6] hover:text-white hover:bg-[#1b1b1b] focus-visible-ring"
      >
        {open ? 'Close' : 'Menu'}
      </button>

      {open ? (
        <nav id="mobile-site-menu" className="absolute left-0 right-0 top-full border-t border-[#2a2a2a] bg-[#111111] px-5 py-5 shadow-[0_16px_40px_rgba(0,0,0,0.38)]" aria-label="Mobile">
          <ul className="flex flex-col gap-2 text-[13px] uppercase tracking-[0.08em] text-[#f3efe6]">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`min-h-[48px] px-4 rounded-md hover:text-white hover:bg-[#1b1b1b] flex items-center focus-visible-ring ${pathname === link.href ? 'text-white bg-[#1b1b1b]' : ''}`}
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
                className={`min-h-[48px] px-4 rounded-md border border-[#3a3a3a] hover:border-[#aaa59c] hover:bg-[#1b1b1b] flex items-center justify-between focus-visible-ring ${pathname === '/cart' ? 'text-white bg-[#1b1b1b] border-[#f3efe6]' : ''}`}
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
