import Link from "next/link";
import Image from "next/image";

import { RevealItem, RevealStagger } from "@/components/motion/RevealStagger";
import { Reveal } from "@/components/motion/Reveal";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

const FALLBACK_IMAGES: Record<string, string> = {
  oud: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=80",
  floral:
    "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80",
  amber:
    "https://images.unsplash.com/photo-1610461888750-10bfc601b874?auto=format&fit=crop&w=900&q=80",
  citrus:
    "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=900&q=80",
  woody:
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80",
  musk: "https://images.unsplash.com/photo-1588405748880-12d1d2a59d75?auto=format&fit=crop&w=900&q=80",
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80";

export function CategoryShowcase({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="relative bg-parchment py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <Reveal className="mb-16 flex flex-col items-baseline justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              Chapter II
            </p>
            <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-light leading-[0.95] tracking-[-0.01em] text-ink">
              Explore <em className="italic text-brand-gold">by note</em>
            </h2>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink/70 transition-colors hover:text-ink"
          >
            All chapters
            <span className="inline-block h-px w-10 bg-ink/40 transition-all duration-500 group-hover:w-14 group-hover:bg-brand-gold" />
          </Link>
        </Reveal>

        <RevealStagger
          className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.08}
        >
          {categories.map((category, i) => (
            <RevealItem key={category.id} className="h-full">
              <CategoryCard category={category} index={i} />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </section>
  );
}

function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  const image =
    category.image || FALLBACK_IMAGES[category.slug] || DEFAULT_IMAGE;

  return (
    <Link
      href={`/products?category=${category.slug}`}
      className="group/cat relative block h-full"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-ink/5">
        <Image
          src={image}
          alt={category.name}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/cat:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent opacity-90 transition-opacity duration-500 group-hover/cat:opacity-70" />

        <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-brand-gold">
              Chapitre · {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 font-display text-3xl font-light leading-none text-parchment sm:text-4xl">
              {category.name}
            </h3>
          </div>
          <span className="inline-flex size-10 items-center justify-center rounded-full border border-parchment/70 text-parchment transition-all duration-500 group-hover/cat:bg-brand-gold group-hover/cat:text-ink">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
