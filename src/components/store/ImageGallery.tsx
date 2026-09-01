"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, useRef } from "react";

import { ParallaxImage } from "@/components/motion/ParallaxImage";
import { PerfumeCursor } from "@/components/store/PerfumeCursor";
import { getFragranceHoverClasses, getOverlayClasses, getAnimationClass, getShimmerOverlayClass } from "@/lib/fragranceStyles";

export function ImageGallery({
  images,
  name,
  categorySlug,
}: {
  images: string[];
  name: string;
  categorySlug?: string | null;
}) {
  const [active, setActive] = useState(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div
        className="flex aspect-[3/4] w-full items-center justify-center bg-parchment-deep"
        style={{
          borderTopLeftRadius: "100% 60%",
          borderTopRightRadius: "100% 60%",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
        }}
      >
        <span className="font-display text-[10rem] italic text-ink/15">
          {name.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        ref={imageContainerRef}
        className="group relative aspect-[3/4] overflow-hidden bg-parchment-deep shadow-[0_30px_70px_-40px_rgba(26,24,20,0.4)] cursor-none"
        style={{
          borderTopLeftRadius: "100% 60%",
          borderTopRightRadius: "100% 60%",
          borderBottomLeftRadius: "8px",
          borderBottomRightRadius: "8px",
        }}
      >
        <PerfumeCursor containerRef={imageContainerRef} />
        <div className={getOverlayClasses(categorySlug)} />
        {getShimmerOverlayClass(categorySlug) && (
          <div className={getShimmerOverlayClass(categorySlug)}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={images[active]}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
            className={`absolute inset-0 ${getFragranceHoverClasses(categorySlug)} ${getAnimationClass(categorySlug)}`}
          >
            <ParallaxImage amount={4} className="size-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[active]}
                alt={name}
                className="size-full object-cover"
              />
            </ParallaxImage>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 rounded-full border border-parchment/20 bg-ink/75 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-parchment shadow-sm backdrop-blur-md">
          <span className="inline-block size-1.5 rounded-full bg-brand-gold" />
          Plate · {String(active + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </div>
      </div>

      {images.length > 1 && (
        <div className="overflow-x-auto">
          <div className="flex gap-2 sm:gap-3">
            {images.slice(0, 6).map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`View plate ${i + 1}`}
                className="group relative aspect-square w-16 sm:w-20 flex-shrink-0 overflow-hidden bg-parchment-deep"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="size-full object-cover transition-opacity duration-300 group-hover:opacity-90"
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-px transition-all duration-500 ${
                  i === active ? "bg-brand-gold" : "bg-transparent group-hover:bg-ink/30"
                }`}
              />
              {i === active && (
                <span className="absolute inset-0 ring-1 ring-inset ring-brand-gold/60" />
              )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
