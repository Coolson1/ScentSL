import Link from "next/link";

import { formatSLE } from "@/lib/utils";

export type ProductCardData = {
  slug: string;
  name: string;
  images: string[];
  category?: { name: string } | null;
  variants: { price: number; stock: number }[];
};

function lowestPrice(variants: { price: number }[]) {
  if (variants.length === 0) return null;
  return variants.reduce(
    (min, v) => (v.price < min ? v.price : min),
    variants[0].price,
  );
}

function totalStock(variants: { stock: number }[]) {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

export function ProductCard({ product }: { product: ProductCardData }) {
  const price = lowestPrice(product.variants);
  const stock = totalStock(product.variants);
  const heroImage = product.images[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group/card relative flex h-full flex-col justify-between focus-visible:outline-2 focus-visible:outline-brand-gold"
    >
      <div className="flex flex-1 flex-col">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[40px] sm:rounded-t-[80px] lg:rounded-t-[120px] bg-parchment-deep border border-ink/5">
          {heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroImage}
              alt={product.name}
              className="size-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-b from-parchment-deep to-parchment">
              <span className="font-display text-4xl sm:text-[6rem] italic leading-none text-ink/15">
                {product.name.charAt(0)}
              </span>
            </div>
          )}

          {/* corner caption / note tag */}
          <div className="pointer-events-none absolute left-2 top-2 sm:left-4 sm:top-4 z-10 flex items-center gap-1 sm:gap-2 rounded-full border border-ink/15 bg-parchment/90 px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] font-medium uppercase tracking-[0.18em] sm:tracking-[0.25em] text-ink/90 shadow-xs backdrop-blur-md">
            <span className="inline-block size-1 sm:size-1.5 rounded-full bg-brand-gold shrink-0" />
            <span className="truncate max-w-[80px] sm:max-w-none">
              {product.category?.name ?? "Maison"}
            </span>
          </div>

          {stock === 0 && (
            <span className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-full border border-ink/60 bg-parchment/90 px-2 py-0.5 sm:px-3 sm:py-1 text-[8px] sm:text-[10px] uppercase tracking-[0.18em] sm:tracking-[0.28em] text-ink backdrop-blur-xs">
              Sold out
            </span>
          )}

          {/* discover overlay */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden sm:flex translate-y-2 items-end justify-between opacity-0 transition-all duration-500 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100">
            <span className="font-display text-sm sm:text-base italic text-ink drop-shadow-sm bg-parchment/80 px-2.5 py-0.5 rounded-full backdrop-blur-xs">
              Discover scent →
            </span>
          </div>
        </div>

        {/* Product Info below image */}
        <div className="flex flex-1 flex-col justify-between pt-2.5 sm:pt-4">
          <div>
            <h3 className="font-display text-xs font-light leading-snug text-ink transition-colors duration-300 group-hover/card:text-brand-gold sm:text-lg md:text-xl lg:text-2xl line-clamp-2">
              {product.name}
            </h3>
          </div>
          <div className="mt-1 sm:mt-2">
            <span className="font-display text-xs font-normal tabular-nums text-ink/90 sm:text-base md:text-lg">
              {price === null ? "—" : formatSLE(price)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 sm:mt-4 h-px w-full bg-ink/12" />
    </Link>
  );
}
