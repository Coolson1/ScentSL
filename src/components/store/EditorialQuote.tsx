import { Reveal } from "@/components/motion/Reveal";
import { Ornament } from "./Ornament";

export function EditorialQuote() {
  return (
    <section className="relative isolate overflow-hidden bg-parchment py-32 lg:py-48">
      <Ornament
        variant="glyph"
        className="pointer-events-none absolute left-1/2 top-1/2 size-[700px] -translate-x-1/2 -translate-y-1/2 text-brand-gold"
      />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
            A note from the maison
          </p>
        </Reveal>
        <Reveal delay={0.12} className="mt-10">
          <blockquote className="font-display text-[clamp(2rem,5vw,3.8rem)] font-light leading-[1.05] tracking-[-0.01em] text-ink">
            &ldquo;Smell is a word.{" "}
            <em className="italic text-brand-gold">Perfume</em> is literature,
            a way of keeping the unkeepable.&rdquo;
          </blockquote>
        </Reveal>
        <Reveal delay={0.28} className="mt-10 inline-flex flex-col items-center">
          <span className="inline-block h-px w-12 bg-ink/30" />
          <span className="mt-3 text-[11px] uppercase tracking-[0.4em] text-ink/60">
            Sékou Bangura · founding perfumer
          </span>
        </Reveal>
      </div>
    </section>
  );
}
