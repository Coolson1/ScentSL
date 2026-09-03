import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { ParallaxImage } from "@/components/motion/ParallaxImage";

const SPLIT_IMAGE = "/images/ysl_libre_bottle.jpg";

export function EditorialSplit() {
  return (
    <section className="relative bg-parchment-soft py-24 lg:py-32">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-stretch gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-20 lg:px-12">
        <Reveal className="relative lg:col-span-7">
          <div className="relative aspect-[4/5] w-full overflow-hidden lg:aspect-[1/1.05]">
            <ParallaxImage amount={5} className="size-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={SPLIT_IMAGE}
                alt="Libre | YSL"
                className="size-full object-cover"
              />
            </ParallaxImage>
          </div>

          <p className="absolute -bottom-5 left-4 text-[10px] uppercase tracking-[0.32em] text-ink/55">
            Plate III — atelier, Freetown, 04:38
          </p>
        </Reveal>

        <div className="relative flex flex-col justify-center lg:col-span-5">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              The Atelier
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.6rem)] font-light leading-[1.04] tracking-[-0.01em] text-ink">
              Composed in small chapters, never in seasons.
            </h2>
          </Reveal>
          <Reveal delay={0.22} className="mt-7">
            <div className="space-y-4 font-serif text-lg leading-relaxed text-ink/75">
              <p>
                Every formula begins at the back room — a wooden table, a stack
                of <em>fiches d&apos;accords</em>, and a window kept open to the
                sea air.
              </p>
              <p>
                We bottle in editions, not collections. When a chapter is gone,
                it&apos;s closed; the formula is signed and archived. A perfume
                is a kept moment.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.34} className="mt-10">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 rounded-none border-b border-ink pb-2 text-[11px] uppercase tracking-[0.32em] text-ink transition-colors hover:border-brand-gold hover:text-brand-gold"
            >
              Read the journal
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
