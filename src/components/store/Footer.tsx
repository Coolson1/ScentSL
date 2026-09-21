import Link from "next/link";
import Image from "next/image";

import { Ornament } from "./Ornament";

export function Footer() {
  return (
    <footer className="relative mt-32 overflow-hidden bg-ink text-parchment">
      {/* botanical watermark */}
      <Ornament
        variant="botanical"
        className="pointer-events-none absolute -right-10 -top-10 size-[420px] text-brand-gold/15"
      />
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -bottom-8 left-[8%] size-[220px] -rotate-12 text-brand-gold/12"
      />

      <div className="relative mx-auto max-w-[1400px] px-5 pb-12 pt-20 sm:px-8 lg:px-12">
        {/* huge wordmark with logo */}
        <div className="flex flex-col items-center gap-3 pb-14 text-center">
          <div className="relative mb-1 overflow-hidden rounded-full border border-brand-gold/50 shadow-md">
            <Image
              src="/scentsl.jpeg"
              alt="ScentSL Logo"
              width={64}
              height={64}
              className="h-16 w-16 rounded-full object-cover"
            />
          </div>
          <span className="text-[10px] uppercase tracking-[0.5em] text-brand-gold font-medium">
            ScentSL Maison Ltd. · Est. 2024
          </span>
          <h2 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-none tracking-[0.04em]">
            Scent<em className="font-normal italic text-brand-gold">SL</em>
          </h2>
          <div className="mt-3 h-px w-24 bg-brand-gold/60" />
        </div>

        <div className="grid gap-12 border-t border-parchment/15 pt-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-2xl italic leading-tight text-parchment/90">
              A small archive of fragrance, blended in Freetown — composed for
              those who collect their hours.
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.32em] text-brand-gold font-medium">
              hello@scentsl.com
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.32em] text-parchment/80">
              ScentSL Maison Ltd. · Freetown, Sierra Leone
            </p>
          </div>

          <div className="md:col-span-2">
            <FooterHeader>Shop</FooterHeader>
            <FooterList
              links={[
                { href: "/products", label: "Collection" },
                { href: "/products?category=oud", label: "Oud" },
                { href: "/products?category=floral", label: "Floral" },
                { href: "/products?category=amber", label: "Amber" },
              ]}
            />
          </div>

          <div className="md:col-span-2">
            <FooterHeader>Governance & Legal</FooterHeader>
            <FooterList
              links={[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/refund-policy", label: "Refund Policy" },
                { href: "/cookie-policy", label: "Cookie Policy" },
                { href: "/data-deletion", label: "Data Deletion" },
              ]}
            />
          </div>

          <div className="md:col-span-4">
            <FooterHeader>Letters</FooterHeader>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-parchment/80">
              Quiet correspondence on new chapters, private releases, and
              fragrance journals. No more than twice a month.
            </p>
            <form className="mt-5 flex items-end gap-3 border-b border-parchment/40 pb-2 focus-within:border-brand-gold">
              <input
                type="email"
                required
                placeholder="Your email address"
                aria-label="Your email address for newsletter subscription"
                className="flex-1 bg-transparent text-sm text-parchment placeholder:text-parchment/50 focus:outline-none"
              />
              <button
                type="submit"
                className="text-[11px] uppercase tracking-[0.32em] text-brand-gold transition-colors hover:text-parchment focus-visible:outline-2 focus-visible:outline-brand-gold"
              >
                Subscribe →
              </button>
            </form>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-parchment/65">
              Unsubscribe anytime using the link in our letters or emailing hello@scentsl.com.
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-parchment/15 pt-6 text-[10px] uppercase tracking-[0.32em] text-parchment/75 sm:flex-row">
          <span>© {new Date().getFullYear()} ScentSL Maison Ltd. — All rights reserved.</span>
          <div className="flex flex-wrap gap-6">
            <Link href="/privacy" className="transition-colors hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-brand-gold">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-brand-gold">
              Terms
            </Link>
            <Link href="/refund-policy" className="transition-colors hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-brand-gold">
              Refunds
            </Link>
            <Link href="/cookie-policy" className="transition-colors hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-brand-gold">
              Cookies
            </Link>
            <Link href="/data-deletion" className="transition-colors hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-brand-gold">
              Data Rights
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] uppercase tracking-[0.4em] text-brand-gold font-medium">
      {children}
    </h3>
  );
}

function FooterList({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="mt-4 flex flex-col gap-2.5">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            href={link.href}
            className="text-sm text-parchment/85 transition-colors hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-brand-gold"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
