"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { Ornament } from "./Ornament";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-parchment pt-10 sm:pt-16 lg:pt-20">
      {/* edition meta — top corners */}
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 text-[10px] uppercase tracking-[0.4em] text-ink/55 sm:px-8 lg:px-12">
        <span>Vol. I · No. 01</span>
        <span className="hidden sm:inline">— Une archive olfactive —</span>
        <span>MMXXVI · Freetown</span>
      </div>

      {/* botanical bleed */}
      <Ornament
        variant="botanical"
        className="pointer-events-none absolute -left-16 top-32 hidden h-[480px] w-[480px] text-brand-gold/30 lg:block"
      />
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute bottom-12 right-[6%] hidden h-[260px] w-[200px] text-ink/12 lg:block"
      />

      <div className="relative mx-auto grid max-w-[1400px] grid-cols-1 items-end gap-10 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:pb-28 lg:pt-20">
        {/* LEFT — editorial copy */}
        <div className="relative z-10 lg:col-span-7">
          <motion.p
            initial={{ opacity: 1, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut }}
            className="text-[10px] uppercase tracking-[0.5em] text-brand-gold"
          >
            Maison ScentSL · Édition d&apos;Hiver
          </motion.p>

          <h1 className="mt-7 font-display text-[clamp(3.2rem,8.5vw,7.5rem)] font-light leading-[0.92] tracking-[-0.015em] text-ink">
            <HeroLine delay={0.1}>The scent</HeroLine>
            <HeroLine delay={0.22}>
              of <em className="font-extralight italic text-brand-gold">a season</em>
            </HeroLine>
            <HeroLine delay={0.34}>kept on paper.</HeroLine>
          </h1>

          <motion.p
            initial={{ opacity: 1, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.5 }}
            className="mt-10 max-w-md font-serif text-lg leading-relaxed text-ink/75"
          >
            Each fragrance is composed slowly, by hand, in our atelier in
            Freetown — small batches, raw materials sourced near home, formulas
            archived in the back room like letters.
          </motion.p>

          <motion.div
            initial={{ opacity: 1, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: easeOut, delay: 0.62 }}
            className="mt-10 flex flex-wrap items-center gap-7"
          >
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] hover:bg-brand-gold hover:text-ink"
            >
              Explore the archive
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </Link>
            <Link
              href="/products?category=oud"
              className="group relative pb-2 text-[11px] uppercase tracking-[0.32em] text-ink/80 transition-colors hover:text-ink"
            >
              The Oud chapter
              <span className="absolute bottom-0 left-0 h-px w-full origin-right scale-x-100 bg-ink/30 transition-transform duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:origin-left group-hover:bg-brand-gold" />
            </Link>
          </motion.div>

          {/* lower meta */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.9 }}
            className="mt-16 grid max-w-md grid-cols-3 gap-6 border-t border-ink/12 pt-6 text-[10px] uppercase tracking-[0.28em] text-ink/55"
          >
            <div>
              <p className="text-brand-gold">Top</p>
              <p className="mt-1">Bergamot · Cardamom</p>
            </div>
            <div>
              <p className="text-brand-gold">Heart</p>
              <p className="mt-1">Rose · Jasmine</p>
            </div>
            <div>
              <p className="text-brand-gold">Base</p>
              <p className="mt-1">Oud · Vetiver</p>
            </div>
          </motion.div>
        </div>

        {/* RIGHT — arched image */}
        <motion.div
          initial={{ opacity: 1, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOut, delay: 0.2 }}
          className="relative z-10 lg:col-span-5"
        >
          <div className="relative mx-auto aspect-[3/4] w-full max-w-[440px]">
            {/* arch frame */}
            <div
              className="absolute inset-0 overflow-hidden bg-parchment-deep shadow-[0_30px_60px_-30px_rgba(26,24,20,0.35)]"
              style={{
                borderTopLeftRadius: "100% 60%",
                borderTopRightRadius: "100% 60%",
                borderBottomLeftRadius: "8px",
                borderBottomRightRadius: "8px",
              }}
            >
              <ParallaxImage amount={6} className="size-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={HERO_IMAGE}
                  alt="A bottle of ScentSL fragrance against parchment"
                  className="size-full object-cover"
                />
              </ParallaxImage>
            </div>

            {/* corner caption */}
            <div className="absolute -right-3 -top-6 hidden flex-col items-end gap-1 text-right text-[10px] uppercase tracking-[0.32em] text-ink/70 sm:flex">
              <span className="font-display text-3xl italic normal-case tracking-normal text-brand-gold">
                N°.01
              </span>
              <span>Sierra · Bloom</span>
              <span className="text-ink/45">EDP 50 ml</span>
            </div>

            {/* serial */}
            <div className="absolute -bottom-6 left-0 flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-ink/55">
              <span className="inline-block h-px w-8 bg-ink/30" />
              Formula · 00012-S
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroLine({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <span className="block overflow-hidden">
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.95, ease: easeOut, delay }}
        className="inline-block"
      >
        {children}
      </motion.span>
    </span>
  );
}
