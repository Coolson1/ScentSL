import { Reveal } from "@/components/motion/Reveal";
import { Ornament } from "./Ornament";

export function Newsletter() {
  return (
    <section className="relative overflow-hidden bg-parchment-deep py-24 lg:py-32">
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -left-10 top-10 hidden h-[280px] w-[200px] text-ink/15 lg:block"
      />
      <Ornament
        variant="sprig"
        className="pointer-events-none absolute -right-10 bottom-10 hidden h-[280px] w-[200px] -scale-x-100 text-ink/15 lg:block"
      />

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
            Subscribe to the journal
          </p>
        </Reveal>
        <Reveal delay={0.1} className="mt-6">
          <h2 className="font-display text-[clamp(2.2rem,4.8vw,3.6rem)] font-light leading-[1.05] tracking-[-0.01em] text-ink">
            Quiet letters,{" "}
            <em className="italic text-brand-gold">delivered slowly.</em>
          </h2>
        </Reveal>
        <Reveal delay={0.18} className="mt-5">
          <p className="mx-auto max-w-md font-serif text-base text-ink/70">
            Twice a month: the new chapter, the back-of-the-bottle notes, and
            the occasional private release before it&apos;s announced.
          </p>
        </Reveal>
        <Reveal delay={0.26} className="mx-auto mt-10 max-w-md">
          <form className="flex items-end gap-3 border-b border-ink/40 pb-2 focus-within:border-brand-gold">
            <input
              type="email"
              required
              placeholder="your-email@maison.com"
              aria-label="Email address to subscribe to ScentSL journal"
              className="flex-1 bg-transparent text-base text-ink placeholder:text-ink/50 focus:outline-none"
            />
            <button
              type="submit"
              className="group inline-flex items-center gap-2 pb-1 text-[11px] uppercase tracking-[0.32em] text-ink transition-colors hover:text-brand-gold focus-visible:outline-2 focus-visible:outline-brand-gold"
            >
              Subscribe
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </button>
          </form>
          <p className="mt-3 text-left text-[10px] uppercase tracking-[0.24em] text-ink/75">
            Zero spam. Unsubscribe at any time with one click or by contacting hello@scentsl.com.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
