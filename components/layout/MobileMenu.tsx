'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { NavigationLink } from '@/data/navigation';

interface MobileMenuProps {
  links: NavigationLink[];
}

export default function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-site-menu"
        onClick={() => setOpen((prev) => !prev)}
        className="text-[11px] uppercase tracking-[0.17em] text-[#d0c3ad] hover:text-[#f0ebdf]"
      >
        Menu
      </button>

      {open ? (
        <nav id="mobile-site-menu" className="absolute left-0 right-0 top-full border-t border-[#1f1f1f] bg-[#0a0a0af2] backdrop-blur px-5 py-4">
          <ul className="flex flex-col gap-3 text-[11px] uppercase tracking-[0.16em] text-[#d4c8b3]">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-[#f0ebdf]" onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
