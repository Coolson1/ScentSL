"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatSLE } from "@/lib/utils";

type SearchResultItem = {
  id: string;
  slug: string;
  name: string;
  images: string[];
  category?: { name: string } | null;
  variants: { price: number; stock: number }[];
};

export function NavbarSearch() {
  return (
    <Suspense fallback={<NavbarSearchFallback />}>
      <NavbarSearchInner />
    </Suspense>
  );
}

function NavbarSearchFallback() {
  return (
    <div className="relative flex items-center">
      <div className="hidden md:flex relative items-center w-48 lg:w-64">
        <div className="relative flex w-full items-center">
          <SearchIcon className="pointer-events-none absolute left-3 size-3.5 text-ink/50" />
          <input
            type="text"
            disabled
            placeholder="Search fragrances..."
            className="w-full rounded-full border border-ink/20 bg-parchment-soft/80 py-1.5 pl-8 pr-7 text-xs text-ink placeholder:text-ink/45 shadow-xs"
          />
        </div>
      </div>
    </div>
  );
}

function NavbarSearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);

  const initialQuery = searchParams.get("search") || searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Sync state if searchParam changes externally
  useEffect(() => {
    setQuery(searchParams.get("search") || searchParams.get("q") || "");
  }, [searchParams]);

  // Handle click outside to close autocomplete dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced live fetch
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
        }
      } catch (err) {
        console.error("Failed to fetch live search results", err);
      } finally {
        setIsLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    setIsOpen(false);
    setIsMobileOpen(false);
    if (trimmed) {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/products");
    }
  }

  function handleSelectProduct(slug: string) {
    setIsOpen(false);
    setIsMobileOpen(false);
    router.push(`/products/${slug}`);
  }

  function lowestPrice(variants: { price: number }[]) {
    if (!variants || variants.length === 0) return null;
    return variants.reduce((min, v) => (v.price < min ? v.price : min), variants[0].price);
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Desktop Search Bar */}
      <form
        onSubmit={handleSubmit}
        className="hidden md:flex relative items-center w-48 lg:w-64 transition-all duration-300 focus-within:w-64 lg:focus-within:w-80"
      >
        <div className="relative flex w-full items-center">
          <SearchIcon className="pointer-events-none absolute left-3 size-3.5 text-ink/50" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            placeholder="Search fragrances..."
            aria-label="Search fragrances"
            className="w-full rounded-full border border-ink/20 bg-parchment-soft/80 py-1.5 pl-8 pr-7 text-xs text-ink placeholder:text-ink/45 focus:border-brand-gold focus:bg-parchment focus:outline-none focus:ring-1 focus:ring-brand-gold/50 shadow-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              aria-label="Clear search"
              className="absolute right-2.5 rounded-full p-0.5 text-ink/40 hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>
      </form>

      {/* Mobile Search Toggle Icon */}
      <button
        type="button"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle search"
        className="flex md:hidden p-1.5 text-ink/75 transition-colors hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-brand-gold rounded-full"
      >
        <SearchIcon className="size-[18px]" />
      </button>

      {/* Mobile Search Overlay Bar */}
      {isMobileOpen && (
        <div className="fixed inset-x-3 top-16 sm:top-20 z-50 mx-auto max-w-md rounded-2xl border border-ink/20 bg-parchment-soft p-3 shadow-2xl backdrop-blur-md md:hidden animate-in fade-in duration-200">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <SearchIcon className="size-4 text-ink/50 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              placeholder="Search fragrances..."
              aria-label="Search fragrances"
              className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink/45 focus:outline-none min-w-0"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-[10px] uppercase text-ink/50 hover:text-ink shrink-0"
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="rounded-full bg-ink px-3 py-1 text-[10px] uppercase tracking-widest text-parchment hover:bg-brand-gold hover:text-ink shrink-0"
            >
              Go
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileOpen(false);
                setIsOpen(false);
              }}
              className="ml-1 rounded-full p-1 text-xs text-ink/50 hover:text-ink shrink-0"
              aria-label="Close search"
            >
              ✕
            </button>
          </form>

          {/* Mobile Autocomplete Panel inside Overlay */}
          {isOpen && query.trim().length >= 2 && (
            <div className="mt-2.5 max-h-72 overflow-y-auto rounded-xl border border-ink/15 bg-parchment-soft/95 p-2 shadow-lg backdrop-blur-md">
              {isLoading ? (
                <div className="py-4 text-center text-xs italic text-ink/60">
                  Searching atelier...
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  <p className="px-2 py-1 text-[9px] uppercase tracking-[0.28em] text-brand-gold font-medium">
                    Fragrances found ({results.length})
                  </p>
                  {results.map((product) => {
                    const price = lowestPrice(product.variants);
                    const image = product.images[0];
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleSelectProduct(product.slug)}
                        className="flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left transition-colors hover:bg-brand-gold/15 focus:outline-none"
                      >
                        <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-ink/10 bg-parchment-deep">
                          {image ? (
                            <Image
                              src={image}
                              alt={product.name}
                              fill
                              className="object-contain p-0.5"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center font-display text-xs text-ink/40">
                              {product.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-display text-xs font-light text-ink">
                            {product.name}
                          </p>
                          <p className="text-[8px] uppercase tracking-[0.18em] text-ink/55 truncate">
                            {product.category?.name ?? "Maison"}
                          </p>
                        </div>
                        <div className="font-display text-xs tabular-nums text-ink/85 shrink-0">
                          {price ? formatSLE(price) : ""}
                        </div>
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="mt-2 block w-full rounded-md border border-ink/15 py-1.5 text-center text-[10px] uppercase tracking-[0.24em] text-ink transition-colors hover:border-brand-gold hover:text-brand-gold"
                  >
                    View all results →
                  </button>
                </div>
              ) : (
                <div className="py-3 text-center">
                  <p className="font-serif text-xs italic text-ink/70">
                    No fragrances found matching &ldquo;{query}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Desktop Autocomplete Dropdown Panel */}
      {isOpen && query.trim().length >= 2 && !isMobileOpen && (
        <div className="absolute left-0 right-0 md:left-auto md:right-0 top-full mt-2 w-full md:w-80 rounded-xl border border-ink/15 bg-parchment-soft p-2.5 shadow-xl backdrop-blur-md z-50 max-h-80 overflow-y-auto hidden md:block">
          {isLoading ? (
            <div className="py-4 text-center text-xs italic text-ink/60">
              Searching atelier...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <p className="px-2 py-1 text-[9px] uppercase tracking-[0.28em] text-brand-gold font-medium">
                Fragrances found ({results.length})
              </p>
              {results.map((product) => {
                const price = lowestPrice(product.variants);
                const image = product.images[0];
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleSelectProduct(product.slug)}
                    className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-brand-gold/15 focus:outline-none"
                  >
                    <div className="relative size-9 shrink-0 overflow-hidden rounded-md border border-ink/10 bg-parchment-deep">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center font-display text-xs text-ink/40">
                          {product.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-display text-sm font-light text-ink">
                        {product.name}
                      </p>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-ink/55">
                        {product.category?.name ?? "Maison"}
                      </p>
                    </div>
                    <div className="font-display text-xs tabular-nums text-ink/85">
                      {price ? formatSLE(price) : ""}
                    </div>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-2 block w-full rounded-md border border-ink/15 py-1.5 text-center text-[10px] uppercase tracking-[0.28em] text-ink transition-colors hover:border-brand-gold hover:text-brand-gold"
              >
                View all results for &ldquo;{query}&rdquo; →
              </button>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="font-serif text-sm italic text-ink/70">
                No fragrances found matching &ldquo;{query}&rdquo;
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                className="mt-2 inline-block text-[10px] uppercase tracking-[0.24em] text-brand-gold hover:underline"
              >
                Browse all fragrances →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.3" />
      <path d="M16 16L21 21" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
