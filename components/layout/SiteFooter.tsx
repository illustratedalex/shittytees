import Link from 'next/link';
import { BRAND } from '@/data/brand';

export default function SiteFooter() {
  const socialLinks = BRAND.socialPlaceholder;

  return (
    <footer className="bg-[#111111] text-[#f3efe6] border-t border-[#2a2a2a] py-14 sm:py-16">
      <div className="site-shell">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <h2 className="footer-col-title">Shop</h2>
            <div className="footer-link-list">
              <Link href="/shop" className="footer-link">Shop</Link>
              <Link href="/drops/drop-001" className="footer-link">Drop 001</Link>
              <Link href="/collections" className="footer-link">Collections</Link>
            </div>
          </div>

          <div>
            <h2 className="footer-col-title">Help</h2>
            <div className="footer-link-list">
              <Link href="/faq" className="footer-link">FAQ</Link>
              <Link href="/returns" className="footer-link">Returns</Link>
              <Link href="/contact" className="footer-link">Contact</Link>
            </div>
          </div>

          <div>
            <h2 className="footer-col-title">About</h2>
            <div className="footer-link-list">
              <Link href="/about" className="footer-link">About</Link>
              <Link href="/privacy" className="footer-link">Privacy</Link>
              <Link href="/terms" className="footer-link">Terms</Link>
            </div>
          </div>

          <div>
            <h2 className="footer-col-title">Follow</h2>
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
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#2a2a2a] flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-[0.95rem] font-semibold tracking-[0.07em] uppercase text-white">ShittyTees</p>
            <p className="text-[0.95rem] text-[#aaa59c]">Terrible Ideas. Excellent Shirts.</p>
          </div>
          <p className="text-[0.92rem] text-[#aaa59c]">Built &amp; Managed by DeadSignal</p>
        </div>
      </div>
    </footer>
  );
}
