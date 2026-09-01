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
          <span className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
            Maison · Est. 2024
          </span>
          <h2 className="font-display text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-none tracking-[0.04em]">
            Scent<em className="font-normal italic text-brand-gold">SL</em>
          </h2>
          <div className="mt-3 h-px w-24 bg-brand-gold/60" />
        </div>

        <div className="grid gap-12 border-t border-parchment/12 pt-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="font-display text-2xl italic leading-tight text-parchment/85">
              A small archive of fragrance, blended in Freetown — composed for
              those who collect their hours.
            </p>
            <p className="mt-6 text-[11px] uppercase tracking-[0.32em] text-brand-gold/80">
              hello@scentsl.com
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.32em] text-parchment/55">
              Freetown · Sierra Leone
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
            <FooterHeader>Account</FooterHeader>
            <FooterList
              links={[
                { href: "/account", label: "Profile" },
                { href: "/account/orders", label: "Orders" },
                { href: "/wishlist", label: "Wishlist" },
                { href: "/cart", label: "Bag" },
              ]}
            />
          </div>

          <div className="md:col-span-4">
            <FooterHeader>Letters</FooterHeader>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-parchment/65">
              Quiet correspondence on new chapters, private releases, and
              fragrance journals. No more than twice a month.
            </p>
            <form className="mt-5 flex items-end gap-3 border-b border-parchment/30 pb-2 focus-within:border-brand-gold">
              <input
                type="email"
                required
                placeholder="Your email"
                className="flex-1 bg-transparent text-sm text-parchment placeholder:text-parchment/40 focus:outline-none"
              />
              <button
                type="submit"
                className="text-[11px] uppercase tracking-[0.32em] text-brand-gold transition-colors hover:text-parchment"
              >
                Subscribe →
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-parchment/12 pt-6 text-[10px] uppercase tracking-[0.32em] text-parchment/50 sm:flex-row">
          <span>© {new Date().getFullYear()} ScentSL — all rights reserved.</span>
          <div className="flex gap-6">
            <Link href="#" className="transition-colors hover:text-brand-gold">
              Instagram
            </Link>
            <Link href="#" className="transition-colors hover:text-brand-gold">
              Journal
            </Link>
            <Link href="#" className="transition-colors hover:text-brand-gold">
              Privacy
            </Link>
            <Link href="#" className="transition-colors hover:text-brand-gold">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
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
            className="text-sm text-parchment/70 transition-colors hover:text-brand-gold"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
