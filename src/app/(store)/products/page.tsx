import Link from "next/link";

import { prisma } from "@/lib/prisma";
import {
  buildProductWhere,
  paginate,
  parseProductSearchParams,
  sortProducts,
} from "@/lib/products";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductFilters } from "@/components/store/ProductFilters";
import { ProductSort } from "@/components/store/ProductSort";
import { Reveal } from "@/components/motion/Reveal";

export const revalidate = 60;

type SearchParams = { [key: string]: string | string[] | undefined };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolved = await searchParams;
  const params = parseProductSearchParams(resolved);
  const where = buildProductWhere(params);

  const [allMatching, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        variants: { select: { price: true, stock: true } },
        category: { select: { name: true, slug: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const sorted = sortProducts(allMatching, params.sort);
  const page = paginate(sorted, params.page);
  const products = page.items;
  const total = page.total;
  const totalPages = page.totalPages;
  const activeCategory = categories.find((c) => c.slug === params.category);

  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === "string") sp.set(key, value);
    else if (Array.isArray(value) && value[0]) sp.set(key, value[0]);
  }
  function pageHref(targetPage: number) {
    const next = new URLSearchParams(sp);
    if (targetPage <= 1) next.delete("page");
    else next.set("page", String(targetPage));
    const qs = next.toString();
    return qs ? `/products?${qs}` : "/products";
  }

  return (
    <div className="bg-parchment pb-32">
      {/* Editorial header */}
      <header className="border-b border-ink/10 bg-parchment-soft pb-16 pt-16 lg:pt-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              {activeCategory
                ? `Chapter · ${activeCategory.name}`
                : params.gender
                  ? `Collection · ${params.gender === "MEN" ? "Men's Fragrances" : params.gender === "WOMEN" ? "Women's Fragrances" : "Unisex Fragrances"}`
                  : "The Collection · all chapters"}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-5 font-display text-[clamp(3rem,7vw,5.6rem)] font-light leading-[0.92] tracking-[-0.015em] text-ink">
              {activeCategory ? (
                <>
                  {activeCategory.name}{" "}
                  <em className="italic text-brand-gold">— a chapter</em>
                </>
              ) : params.gender ? (
                <>
                  {params.gender === "MEN"
                    ? "Men's Fragrances"
                    : params.gender === "WOMEN"
                      ? "Women's Fragrances"
                      : "Unisex Fragrances"}{" "}
                  <em className="italic text-brand-gold">— collection</em>
                </>
              ) : (
                <>
                  Every fragrance,{" "}
                  <em className="italic text-brand-gold">every note.</em>
                </>
              )}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <div className="mt-8 flex items-center gap-6 text-[10px] uppercase tracking-[0.36em] text-ink/55">
              <span className="inline-block h-px w-16 bg-ink/30" />
              <span>
                {total} {total === 1 ? "fragrance" : "fragrances"} in the archive
              </span>
              {totalPages > 1 && (
                <span>
                  · page {page.page} of {totalPages}
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductFilters categories={categories} />
          </div>

          <div>
            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 pb-4">
              <span className="text-[10px] uppercase tracking-[0.4em] text-ink/55">
                Sort
              </span>
              <ProductSort />
            </div>

            <ProductGrid
              products={products}
              columns={3}
              emptyMessage="No fragrances match these filters."
            />

            {totalPages > 1 && (
              <nav className="mt-20 flex items-center justify-between gap-4 border-t border-ink/15 pt-8 text-[10px] uppercase tracking-[0.32em] text-ink/75">
                {page.page > 1 ? (
                  <Link
                    href={pageHref(page.page - 1)}
                    className="group inline-flex items-center gap-3 transition-colors hover:text-brand-gold"
                  >
                    <span className="inline-block h-px w-8 bg-ink/40 transition-all duration-500 group-hover:w-12 group-hover:bg-brand-gold" />
                    Previous chapter
                  </Link>
                ) : (
                  <span aria-hidden />
                )}
                <span className="font-display text-base text-ink/55">
                  {page.page} / {totalPages}
                </span>
                {page.page < totalPages ? (
                  <Link
                    href={pageHref(page.page + 1)}
                    className="group inline-flex items-center gap-3 transition-colors hover:text-brand-gold"
                  >
                    Next chapter
                    <span className="inline-block h-px w-8 bg-ink/40 transition-all duration-500 group-hover:w-12 group-hover:bg-brand-gold" />
                  </Link>
                ) : (
                  <span aria-hidden />
                )}
              </nav>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
