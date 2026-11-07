"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { cn, formatSLE } from "@/lib/utils";

type Variant = { id: string; size: string; price: number; stock: number };

type Props = {
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl: string | null;
  variants: Variant[];
};

export function WishlistRow({
  productId,
  productSlug,
  productName,
  imageUrl,
  variants,
}: Props) {
  const router = useRouter();
  const inStock = variants.find((v) => v.stock > 0) ?? variants[0];
  const [variantId, setVariantId] = useState(inStock?.id ?? "");
  const selected = variants.find((v) => v.id === variantId) ?? inStock;
  const [isAdding, startAdding] = useTransition();
  const [isRemoving, startRemoving] = useTransition();

  function addToCart() {
    if (!selected) return;
    startAdding(async () => {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ variantId: selected.id, quantity: 1 }),
        });
        if (!res.ok) throw new Error("Could not add to cart");
        toast.success("Added to your bag");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  function remove() {
    startRemoving(async () => {
      try {
        const res = await fetch(`/api/wishlist/${productId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Could not remove from wishlist");
        toast("Removed from wishlist");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <article className="group/wish flex flex-col">
      <Link
        href={`/products/${productSlug}`}
        className="relative block aspect-[4/5] overflow-hidden rounded-t-[120px] bg-parchment-deep"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={productName}
            className="size-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/wish:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-display text-7xl italic text-ink/15">
            {productName.charAt(0)}
          </div>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            remove();
          }}
          disabled={isRemoving}
          aria-label="Remove from wishlist"
          className="absolute right-4 top-4 inline-flex size-9 items-center justify-center rounded-full border border-parchment/60 bg-parchment/85 text-ink/75 backdrop-blur-sm transition-colors hover:border-brand-rose hover:text-brand-rose"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
            <path
              d="M12 20s-7-4.5-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.5-7 10-7 10z"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </Link>

      <div className="flex flex-1 flex-col gap-4 pt-5">
        <Link
          href={`/products/${productSlug}`}
          className="font-display text-2xl font-light text-ink transition-colors hover:text-brand-gold"
        >
          {productName}
        </Link>

        {variants.length > 1 ? (
          <div className="relative w-fit">
            <select
              value={variantId}
              onChange={(e) => setVariantId(e.target.value)}
              className="appearance-none border-b border-ink/25 bg-transparent pb-1 pr-8 font-display text-base text-ink focus:border-brand-gold focus:outline-none"
            >
              {variants.map((v) => (
                <option key={v.id} value={v.id} disabled={v.stock === 0}>
                  {v.size} · {formatSLE(v.price)}
                  {v.stock === 0 ? " · sold out" : ""}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-1 top-0 text-ink/50">
              ▾
            </span>
          </div>
        ) : selected ? (
          <p className="text-[10px] uppercase tracking-[0.32em] text-ink/55">
            {selected.size} · {formatSLE(selected.price)}
          </p>
        ) : null}

        <button
          type="button"
          onClick={addToCart}
          disabled={isAdding || !selected || selected.stock === 0}
          className={cn(
            "group/btn mt-1 inline-flex w-fit items-center gap-3 border-b pb-1 text-[11px] uppercase tracking-[0.32em] transition-colors",
            selected?.stock === 0
              ? "border-ink/15 text-ink/35"
              : "border-ink text-ink hover:border-brand-gold hover:text-brand-gold",
          )}
        >
          {selected?.stock === 0
            ? "Sold out"
            : isAdding
              ? "Adding…"
              : "Move to bag"}
          {selected?.stock !== 0 && (
            <span className="inline-block transition-transform duration-500 group-hover/btn:translate-x-1">
              →
            </span>
          )}
        </button>
      </div>
    </article>
  );
}
