import Link from 'next/link';
import { BRAND } from '@/data/brand';

export default function SiteFooter() {
  const socialLinks = BRAND.socialPlaceholder;

  return (
    <footer className="bg-[#0b0b0b] text-[#f2e8d5] border-t border-[#3f382d] py-14 sm:py-16">
      <div className="site-shell">
        <div className="footer-rule" aria-hidden="true" />

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr_1fr] gap-10 mt-8">
          <div>
            <p className="text-[1.2rem] font-semibold tracking-[0.12em] uppercase text-[#f2e8d5]">ShittyTees</p>
            <p className="text-[1.02rem] text-[#c7baa4] mt-1">Terrible Ideas. Excellent Shirts.</p>
          </div>

          <div>
            <h2 className="footer-col-title">Navigate</h2>
            <div className="footer-link-list">
              <Link href="/shop" className="footer-link">Shop</Link>
              <Link href="/about" className="footer-link">About</Link>
              <Link href="/faq" className="footer-link">Shipping</Link>
              <Link href="/returns" className="footer-link">Returns</Link>
              <Link href="/contact" className="footer-link">Contact</Link>
            </div>
          </div>

          <div>
            <h2 className="footer-col-title">Elsewhere</h2>
            <div className="footer-link-list">
              {socialLinks.map((item) => {
                const href = item.platform.toLowerCase() === 'instagram'
                  ? 'https://www.instagram.com/shittytees'
                  : 'https://www.tiktok.com/@shittytees';

                return (
                  <a
                    key={item.platform}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="footer-link"
                  >
                    {item.platform}
                  </a>
                );
              })}
              <Link href="/privacy" className="footer-link">Privacy</Link>
              <Link href="/terms" className="footer-link">Terms</Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#3f382d] flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <p className="text-[0.85rem] uppercase tracking-[0.12em] text-[#9f9787]">Printed loud. Worn often.</p>
          <p className="text-[0.86rem] text-[#8d8678]">Built &amp; managed by DeadSignal.</p>
        </div>
      </div>
    </footer>
  );
}
