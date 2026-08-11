import Link from 'next/link';
import { hasAdminSession } from '@/lib/admin/auth';
import type { ReactNode } from 'react';

const ADMIN_LINKS = [
  { href: '/admin/printful', label: 'PRINTFUL' },
  { href: '/admin/orders', label: 'ORDERS' },
  { href: '/shop', label: 'VIEW STORE' },
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authenticated = await hasAdminSession();

  return (
    <>
      {authenticated ? (
        <header className="sticky top-0 z-40 border-b border-[#f2ecde14] bg-[#0b0a09]/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[#9f9787]">ShittyTees Admin</p>
              <h1 className="mt-1 text-[#f2ecde] text-lg sm:text-xl uppercase tracking-[0.2em]">Control Room</h1>
            </div>

            <nav className="flex flex-wrap items-center gap-2 sm:gap-3">
              {ADMIN_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex min-h-[40px] items-center rounded-sm border border-[#f2ecde22] bg-[#12110f] px-3 text-[0.68rem] uppercase tracking-[0.18em] text-[#f2ecde] transition-colors hover:border-[#d7c8b1]"
                >
                  {link.label}
                </Link>
              ))}

              <form action="/api/admin/logout" method="post">
                <button
                  type="submit"
                  className="inline-flex min-h-[40px] items-center rounded-sm border border-[#aa4a4a55] bg-[#2a1111] px-3 text-[0.68rem] uppercase tracking-[0.18em] text-[#ffd7d7] transition-colors hover:border-[#ff8080]"
                >
                  SIGN OUT
                </button>
              </form>
            </nav>
          </div>
        </header>
      ) : null}

      {children}
    </>
  );
}