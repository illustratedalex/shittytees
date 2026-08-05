import Link from 'next/link';
import { BRAND } from '@/data/brand';
import { NAVIGATION } from '@/data/navigation';
import { LogoLockup } from '@/components/brand';

export default function SiteFooter() {
  return (
    <footer className="bg-[#090909] border-t border-[#151515] py-12 sm:py-14">
      <div className="max-w-[96rem] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-9">
          <div>
            <LogoLockup variant="light" layout="horizontal" />
            <p className="text-sm text-[#9f9480] mt-4 max-w-sm">{BRAND.tagline}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-10 gap-y-4 text-[10px] uppercase tracking-[0.14em] text-[#aaa08e]">
            {NAVIGATION.footerPrimary.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-[#f0ebdf]">
                {link.label}
              </Link>
            ))}
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#7d7669] mb-3">Social</p>
            <ul className="space-y-2 text-sm text-[#b8ad98]">
              {BRAND.socialPlaceholder.map((item) => (
                <li key={item.platform}>{item.platform} {item.label}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#131313] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-5 text-[10px] uppercase tracking-[0.14em] text-[#8c8476]">
            {NAVIGATION.footerLegal.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-[#f0ebdf]">
                {item.label}
              </Link>
            ))}
          </div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#7d7669]">{BRAND.footerCopy}</p>
        </div>
      </div>
    </footer>
  );
}
