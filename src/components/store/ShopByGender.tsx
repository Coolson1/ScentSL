import Link from "next/link";
import Image from "next/image";

import { RevealItem, RevealStagger } from "@/components/motion/RevealStagger";
import { Reveal } from "@/components/motion/Reveal";

type GenderItem = {
  id: "MEN" | "WOMEN" | "UNISEX";
  number: "01" | "02" | "03";
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  image: string;
};

const FALLBACK_GENDER_IMAGES: Record<string, string> = {
  MEN: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80",
  WOMEN: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1000&q=80",
  UNISEX: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1000&q=80",
};

export type ShopByGenderProps = {
  images?: {
    men?: string | null;
    women?: string | null;
    unisex?: string | null;
  };
};

export function ShopByGender({ images }: ShopByGenderProps) {
  const genderPanels: GenderItem[] = [
    {
      id: "MEN",
      number: "01",
      title: "Men",
      subtitle: "Bold, refined, and captivating masculine accords crafted for distinction.",
      cta: "Explore Men",
      href: "/products?gender=MEN",
      image: images?.men || FALLBACK_GENDER_IMAGES.MEN,
    },
    {
      id: "WOMEN",
      number: "02",
      title: "Women",
      subtitle: "Luminous florals, velvety gourmands, and intoxicating scents for her.",
      cta: "Explore Women",
      href: "/products?gender=WOMEN",
      image: images?.women || FALLBACK_GENDER_IMAGES.WOMEN,
    },
    {
      id: "UNISEX",
      number: "03",
      title: "Unisex",
      subtitle: "Borderless, versatile compositions designed to transcend definition.",
      cta: "Explore Unisex",
      href: "/products?gender=UNISEX",
      image: images?.unisex || FALLBACK_GENDER_IMAGES.UNISEX,
    },
  ];

  return (
    <section className="relative bg-parchment-soft border-t border-ink/5 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <Reveal className="mb-16 flex flex-col items-baseline justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              Chapter III · Shop by Gender
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-light leading-[0.95] tracking-[-0.01em] text-ink">
              Shop by <em className="italic text-brand-gold">gender</em>
            </h2>
            <p className="mt-3 text-sm text-ink/70 font-sans max-w-md">
              Find the fragrance that feels like yours.
            </p>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink/70 transition-colors hover:text-ink"
          >
            All collections
            <span className="inline-block h-px w-10 bg-ink/40 transition-all duration-500 group-hover:w-14 group-hover:bg-brand-gold" />
          </Link>
        </Reveal>

        <RevealStagger
          className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8"
          stagger={0.1}
        >
          {genderPanels.map((panel) => (
            <RevealItem key={panel.id} className="h-full">
              <GenderCard panel={panel} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function GenderCard({ panel }: { panel: GenderItem }) {
  return (
    <Link
      href={panel.href}
      className="group/gender relative block h-full overflow-hidden border border-ink/10 bg-parchment transition-all duration-700 hover:border-brand-gold/50"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink/5">
        <Image
          src={panel.image}
          alt={`${panel.title} Fragrance Collection`}
          fill
          unoptimized
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/gender:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent transition-opacity duration-500 group-hover/gender:opacity-90" />

        <div className="absolute inset-x-6 top-6 flex items-center justify-between text-parchment/90">
          <span className="font-display text-xs tracking-[0.3em] uppercase text-brand-gold">
            {panel.number} — {panel.title}
          </span>
          <span className="text-[10px] uppercase tracking-[0.32em] text-parchment/60">
            ScentSL
          </span>
        </div>

        <div className="absolute inset-x-6 bottom-6 flex flex-col justify-end">
          <h3 className="font-display text-3xl font-light text-parchment sm:text-4xl">
            {panel.title}
          </h3>
          <p className="mt-2 text-xs text-parchment/80 line-clamp-2 font-sans font-light leading-relaxed">
            {panel.subtitle}
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-parchment/20 pt-4">
            <span className="group/cta inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-parchment transition-colors group-hover/gender:text-brand-gold">
              {panel.cta}
              <span className="inline-block h-px w-6 bg-parchment/50 transition-all duration-500 group-hover/gender:w-10 group-hover/gender:bg-brand-gold" />
            </span>
            <span className="inline-flex size-9 items-center justify-center rounded-full border border-parchment/40 text-parchment transition-all duration-500 group-hover/gender:border-brand-gold group-hover/gender:bg-brand-gold group-hover/gender:text-ink">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
