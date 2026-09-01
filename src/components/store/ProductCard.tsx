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
      className="group/card relative flex flex-col"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[120px] bg-parchment-deep">
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={product.name}
            className="size-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-b from-parchment-deep to-parchment">
            <span className="font-display text-[8rem] italic leading-none text-ink/15">
              {product.name.charAt(0)}
            </span>
          </div>
        )}

        {/* corner caption / note tag */}
        <div className="pointer-events-none absolute left-6 top-6 z-10 flex items-center gap-2 rounded-full border border-ink/15 bg-parchment/85 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] text-ink/90 shadow-sm backdrop-blur-md">
          <span className="inline-block size-1.5 rounded-full bg-brand-gold" />
          {product.category?.name ?? "Maison"}
        </div>

        {stock === 0 && (
          <span className="absolute right-4 top-4 rounded-full border border-ink/60 bg-parchment/85 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-ink backdrop-blur-sm">
            Sold out
          </span>
        )}

        {/* discover overlay */}
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex translate-y-2 items-end justify-between opacity-0 transition-all duration-500 ease-out group-hover/card:translate-y-0 group-hover/card:opacity-100">
          <span className="font-display text-base italic text-parchment drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            Discover the scent
          </span>
          <span className="font-display text-2xl italic text-parchment drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            →
          </span>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-4 pt-5">
        <h3 className="font-display text-xl font-light leading-tight text-ink transition-colors duration-300 group-hover/card:text-brand-gold sm:text-2xl">
          {product.name}
        </h3>
        <span className="shrink-0 font-display text-base tabular-nums text-ink/85 sm:text-lg">
          {price === null ? "—" : formatSLE(price)}
        </span>
      </div>

      <div className="mt-1 h-px w-full bg-ink/12" />
    </Link>
  );
}
