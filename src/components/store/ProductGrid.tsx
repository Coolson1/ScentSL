import { RevealStagger, RevealItem } from "@/components/motion/RevealStagger";
import { ProductCard, type ProductCardData } from "./ProductCard";

type ProductGridProps = {
  products: ProductCardData[];
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
};

export function ProductGrid({
  products,
  emptyMessage = "No fragrances found.",
  columns = 4,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border-y border-ink/10 px-6 py-20 text-center">
        <p className="font-display text-3xl italic text-ink/40">— nothing here yet —</p>
        <p className="mt-3 text-xs uppercase tracking-[0.32em] text-ink/55">
          {emptyMessage}
        </p>
      </div>
    );
  }

  const gridCols =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <RevealStagger
      className={`grid ${gridCols} gap-x-6 gap-y-14 sm:gap-x-8 sm:gap-y-16`}
      stagger={0.06}
    >
      {products.map((product) => (
        <RevealItem key={product.slug} className="h-full">
          <ProductCard product={product} />
        </RevealItem>
      ))}
    </RevealStagger>
  );
}
