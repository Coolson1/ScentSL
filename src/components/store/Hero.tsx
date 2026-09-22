"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

import { formatSLE } from "@/lib/utils";
import { Ornament } from "./Ornament";

export type HeroProductData = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  images: string[];
  category?: { name: string } | null;
  variants: { price: number; stock: number }[];
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const FALLBACK_HERO_SLIDES: HeroProductData[] = [
  {
    slug: "creed-royal-oud",
    name: "Creed Royal Oud",
    description: "A regal blend of Sicilian lemon, pink peppercorn, Indian oud, Tuscan cedar and Sahara cypress.",
    images: ["/creed-aventus-hero.jpg"],
    category: { name: "Oud" },
    variants: [{ price: 78000, stock: 10 }],
  },
];

function lowestPrice(variants: { price: number }[]) {
  if (!variants || variants.length === 0) return null;
  return variants.reduce((min, v) => (v.price < min ? v.price : min), variants[0].price);
}

export function Hero({ products = [] }: { products?: HeroProductData[] }) {
  const slides = products.length > 0 ? products : FALLBACK_HERO_SLIDES;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-rotating timer every 5 seconds (5000ms)
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, slides.length, nextSlide]);

  // Ensure currentIndex is in bounds if products change dynamically
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const currentProduct = slides[currentIndex] || slides[0];
  const price = lowestPrice(currentProduct.variants);
  const heroImage = currentProduct.images[0] || "/creed-aventus-hero.jpg";

  // Touch gesture support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative isolate overflow-hidden bg-parchment pt-10 sm:pt-16 lg:pt-20 select-none"
    >
      {/* edition meta — top corners */}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-2 px-4 sm:px-8 lg:px-12 text-[9px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.38em] text-ink/55 overflow-hidden">
        <span className="shrink-0">Vol. I · No. {String(currentIndex + 1).padStart(2, "0")}</span>
        <span className="hidden sm:inline">— Une archive olfactive —</span>
        <span className="shrink-0 truncate">MMXXVI · Freetown</span>
      </div>

      {/* botanical bleed ornaments */}
      <Ornament
        variant="botanical"
        className="pointer-events-none absolute -left-16 top-32 hidden h-[480px] w-[480px] text-brand-gold/30 lg:block"
      />
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute bottom-12 right-[6%] hidden h-[260px] w-[200px] text-ink/12 lg:block"
      />

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-end gap-8 px-4 pb-16 pt-6 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:pb-28 lg:pt-16">
        {/* LEFT — editorial copy & product info */}
        <div className="relative z-10 order-2 lg:order-1 lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentProduct.slug + "-meta"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: easeOut }}
            >
              <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] sm:tracking-[0.45em] text-brand-gold font-medium truncate">
                Maison ScentSL · Édition {currentProduct.category?.name ?? "Collection"}
              </p>

              <h1 className="mt-4 sm:mt-7 font-display text-[clamp(2.2rem,6.8vw,6rem)] font-light leading-[0.95] tracking-[-0.015em] text-ink break-words max-w-full">
                {currentProduct.name}
              </h1>

              <p className="mt-4 sm:mt-8 max-w-lg font-serif text-sm sm:text-lg leading-relaxed text-ink/75 line-clamp-3">
                {currentProduct.description}
              </p>

              {price !== null && (
                <p className="mt-3 sm:mt-4 font-display text-lg sm:text-2xl font-light text-brand-gold">
                  {formatSLE(price)}
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-7">
            <Link
              href={`/products/${currentProduct.slug}`}
              className="group inline-flex items-center gap-2.5 rounded-full bg-ink px-6 py-3 sm:px-8 sm:py-4 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] sm:tracking-[0.32em] text-parchment transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] hover:bg-brand-gold hover:text-ink shadow-sm"
            >
              Discover fragrance
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/products"
              className="group relative pb-1 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] sm:tracking-[0.32em] text-ink/80 transition-colors hover:text-ink"
            >
              Explore archive
              <span className="absolute bottom-0 left-0 h-px w-full origin-right scale-x-100 bg-ink/30 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:origin-left group-hover:bg-brand-gold" />
            </Link>
          </div>

          {/* Carousel controls & pagination indicators */}
          {slides.length > 1 && (
            <div className="mt-8 sm:mt-12 flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Previous / Next buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous perfume"
                  className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-ink/20 text-ink/75 transition-colors hover:border-brand-gold hover:bg-brand-gold/10 hover:text-ink active:scale-95 text-xs sm:text-base"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next perfume"
                  className="flex size-9 sm:size-10 items-center justify-center rounded-full border border-ink/20 text-ink/75 transition-colors hover:border-brand-gold hover:bg-brand-gold/10 hover:text-ink active:scale-95 text-xs sm:text-base"
                >
                  →
                </button>
              </div>

              {/* Dots / Slide indicators */}
              <div className="flex items-center gap-2">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.slug + "-dot"}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={`Go to slide ${idx + 1}: ${slide.name}`}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx === currentIndex
                        ? "w-6 sm:w-8 bg-brand-gold"
                        : "w-2 bg-ink/25 hover:bg-ink/50"
                    }`}
                  />
                ))}
              </div>

              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.28em] text-ink/45">
                {currentIndex + 1} / {slides.length}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT — arched perfume image hero bottle */}
        <div className="relative z-10 order-1 lg:order-2 lg:col-span-5">
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[340px] sm:max-w-[420px]">
            {/* Arched dome frame */}
            <div
              className="relative overflow-hidden bg-parchment-deep shadow-[0_30px_60px_-30px_rgba(26,24,20,0.35)] border border-ink/10 aspect-[3/4] w-full"
              style={{
                borderTopLeftRadius: "100% 60%",
                borderTopRightRadius: "100% 60%",
                borderBottomLeftRadius: "12px",
                borderBottomRightRadius: "12px",
              }}
            >
              {/* Clean Overlay Badge (never intersects image) */}
              <div className="pointer-events-none absolute right-2.5 top-2.5 sm:right-4 sm:top-4 z-20 flex max-w-[calc(100%-20px)] items-center gap-1 sm:gap-1.5 rounded-full border border-ink/15 bg-parchment/90 px-2.5 py-1 text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.22em] text-ink/90 shadow-xs backdrop-blur-md">
                <span className="font-display italic font-semibold text-brand-gold shrink-0">
                  N°.{String(currentIndex + 1).padStart(2, "0")}
                </span>
                <span className="text-ink/30 shrink-0">·</span>
                <span className="truncate">{currentProduct.category?.name ?? "Atelier"}</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProduct.slug + "-img"}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.7, ease: easeOut }}
                  className="size-full"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={heroImage}
                    alt={currentProduct.name}
                    className="size-full object-cover"
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Serial code info below image */}
            <div className="mt-2.5 flex items-center justify-between gap-2 text-[8px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.28em] text-ink/55 w-full overflow-hidden">
              <span className="truncate max-w-[160px] sm:max-w-[220px] font-medium text-ink/80">{currentProduct.name}</span>
              <span className="shrink-0 text-brand-gold">Edition Archive</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
