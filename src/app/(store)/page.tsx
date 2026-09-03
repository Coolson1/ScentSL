import Link from "next/link";

import { prisma, withRetry } from "@/lib/prisma";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Hero } from "@/components/store/Hero";
import { NotesMarquee } from "@/components/store/NotesMarquee";
import { EditorialQuote } from "@/components/store/EditorialQuote";
import { CategoryShowcase } from "@/components/store/CategoryShowcase";
import { EditorialSplit } from "@/components/store/EditorialSplit";
import { Newsletter } from "@/components/store/Newsletter";
import { Reveal } from "@/components/motion/Reveal";

export const revalidate = 60;

async function loadHomepageData() {
  const [featured, categories] = await withRetry(() =>
    Promise.all([
      prisma.product.findMany({
        where: { isFeatured: true, isActive: true },
        include: {
          variants: { select: { price: true, stock: true } },
          category: { select: { name: true } },
        },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        where: { isFeatured: true },
        orderBy: { name: "asc" },
      }),
    ]),
  );
  return { featured, categories };
}

export default async function HomePage() {
  const { featured, categories } = await loadHomepageData();

  return (
    <>
      <Hero />

      <NotesMarquee />

      {/* Featured */}
      <section className="bg-parchment py-16 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <Reveal className="mb-16 flex flex-col items-baseline justify-between gap-6 sm:flex-row">
            <div>
              <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
                Chapter I · Selected
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.4rem,5vw,4rem)] font-light leading-[0.95] tracking-[-0.01em] text-ink">
                A short list of <em className="italic text-brand-gold">favorites</em>
              </h2>
            </div>
            <Link
              href="/products"
              className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink/70 transition-colors hover:text-ink"
            >
              View all fragrances
              <span className="inline-block h-px w-10 bg-ink/40 transition-all duration-500 group-hover:w-14 group-hover:bg-brand-gold" />
            </Link>
          </Reveal>

          <ProductGrid
            products={featured}
            emptyMessage="The next chapter arrives soon."
          />
        </div>
      </section>

      <EditorialQuote />

      <CategoryShowcase categories={categories} />

      <EditorialSplit />

      <Newsletter />
    </>
  );
}
