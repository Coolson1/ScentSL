"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import Image from "next/image";

const NAV_LINKS = [
  { href: "/products", label: "Collection" },
  { href: "/products?category=oud", label: "Oud" },
  { href: "/products?category=floral", label: "Floral" },
  { href: "/products?category=amber", label: "Amber" },
];


export function NavbarShell({
  cartCount,
  userSlot,
}: {
  cartCount: number;
  userSlot: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      className={`sticky top-0 z-40 border-b transition-all duration-300 ease-[cubic-bezier(0.65,0,0.35,1)] ${
        scrolled
          ? "border-ink/12 bg-parchment/92 backdrop-blur-md"
          : "border-transparent bg-parchment/60 backdrop-blur-[2px]"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1400px] items-center justify-between gap-4 sm:gap-6 px-4 sm:px-5 md:px-8 lg:px-12 transition-[height] duration-300 ${
          scrolled ? "h-12 sm:h-14" : "h-16 sm:h-20"
        }`}
      >
        {/* left nav */}
        <nav className="hidden flex-1 items-center gap-9 md:flex">
          {NAV_LINKS.slice(0, 2).map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
        </nav>

        {/* center logo & wordmark */}
        <Link
          href="/"
          aria-label="ScentSL — home"
          className="group flex items-center gap-2.5 sm:gap-3"
        >
          <div className="relative overflow-hidden rounded-full border border-brand-gold/40 shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Image
              src="/scentsl.jpeg"
              alt="ScentSL Logo"
              width={40}
              height={40}
              className={`rounded-full object-cover transition-all duration-300 ${
                scrolled ? "h-7 w-7 sm:h-8 sm:w-8" : "h-8 w-8 sm:h-10 sm:w-10"
              }`}
            />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display text-[1.35rem] font-light tracking-[0.18em] text-ink transition-colors duration-300 group-hover:text-brand-gold sm:text-[1.6rem]">
              SCENTSL
            </span>
            <span
              className={`text-[8px] sm:text-[9px] uppercase tracking-[0.45em] text-ink/55 transition-opacity duration-300 ${
                scrolled ? "hidden sm:block opacity-0" : "opacity-100"
              }`}
            >
              est. Freetown · maison de parfum
            </span>
          </div>
        </Link>

        {/* right cluster */}
        <div className="flex flex-1 items-center justify-end gap-5 md:gap-7">
          <nav className="hidden md:flex md:items-center md:gap-7">
            {NAV_LINKS.slice(2).map((link) => (
              <NavLink key={link.href} {...link} />
            ))}
          </nav>

          {userSlot}

          <Link
            href="/wishlist"
            aria-label="Wishlist"
            className="hidden text-ink/75 transition-colors hover:text-brand-gold sm:inline-flex"
          >
            <HeartIcon className="size-[18px]" />
          </Link>

          <Link
            href="/cart"
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            className="relative inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.3em] text-ink transition-colors hover:text-brand-gold"
          >
            <BagIcon className="size-[18px]" />
            <span className="hidden sm:inline">Bag</span>
            {cartCount > 0 && (
              <span className="ml-0.5 inline-flex min-w-[20px] items-center justify-center rounded-full bg-brand-gold px-1.5 text-[10px] font-medium tracking-normal text-ink">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* mobile nav */}
      <nav className="flex items-center justify-center gap-6 border-t border-ink/8 px-4 py-2.5 md:hidden">
        {NAV_LINKS.map((link) => (
          <NavLink key={link.href} {...link} compact />
        ))}
      </nav>
    </header>
  );
}

function NavLink(props: { href: string; label: string; compact?: boolean }) {
  return (
    <Suspense fallback={<NavLinkInner {...props} searchParams={null} />}>
      <NavLinkWithSearchParams {...props} />
    </Suspense>
  );
}

function NavLinkWithSearchParams(props: { href: string; label: string; compact?: boolean }) {
  const searchParams = useSearchParams();
  return <NavLinkInner {...props} searchParams={searchParams} />;
}

function NavLinkInner({
  href,
  label,
  compact = false,
  searchParams,
}: {
  href: string;
  label: string;
  compact?: boolean;
  searchParams: ReturnType<typeof useSearchParams> | null;
}) {
  const pathname = usePathname();

  let isActive = false;
  if (searchParams) {
    if (href.includes("?")) {
      const [path, query] = href.split("?");
      const params = new URLSearchParams(query);
      const pathMatches = pathname === path;
      const paramsMatch = Array.from(params.entries()).every(
        ([key, val]) => searchParams.get(key) === val
      );
      isActive = pathMatches && paramsMatch;
    } else {
      isActive = pathname === href;
    }
  } else {
    // Fallback during SSR or loading: match path only
    isActive = pathname === href.split("?")[0];
  }

  return (
    <Link
      href={href}
      className={`group/nav relative transition-colors duration-300 ${
        isActive ? "text-brand-gold font-medium" : "text-ink/75 hover:text-ink"
      } ${
        compact
          ? "text-[10px] uppercase tracking-[0.28em]"
          : "text-[11px] uppercase tracking-[0.34em]"
      }`}
    >
      {label}
      <span
        className={`absolute -bottom-1 left-0 h-px w-full bg-brand-gold transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
          isActive
            ? "scale-x-100 origin-left"
            : "scale-x-0 origin-right group-hover/nav:origin-left group-hover/nav:scale-x-100"
        }`}
      />
    </Link>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M6 8h12l-1 12H7L6 8z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M9 8V6a3 3 0 016 0v2"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
