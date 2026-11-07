import Link from "next/link";
import { cookies } from "next/headers";

import { auth } from "@/lib/auth";
import { CART_SESSION_COOKIE, getCartWithItems } from "@/lib/cart";
import { CartItemRow } from "@/components/store/CartItemRow";
import { Ornament } from "@/components/store/Ornament";
import { Reveal } from "@/components/motion/Reveal";
import { formatSLE } from "@/lib/utils";

async function loadCart() {
  const session = await auth();
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value ?? null;
  if (!session?.user?.id && !sessionId) return null;
  return getCartWithItems({
    userId: session?.user?.id ?? null,
    sessionId: session?.user?.id ? null : sessionId,
  });
}

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await loadCart();
  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="relative mx-auto flex max-w-2xl flex-col items-center justify-center px-5 py-32 text-center sm:px-8">
        <Ornament
          variant="botanical"
          className="pointer-events-none absolute -left-10 top-12 hidden h-[280px] w-[280px] text-brand-gold/20 lg:block"
        />
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
            Your bag
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-light leading-[1.02] tracking-[-0.01em] text-ink">
            The bag <em className="italic text-brand-gold">awaits a chapter.</em>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-md font-serif text-lg leading-relaxed text-ink/70">
            Nothing has been kept inside yet. Explore the archive, where every
            fragrance is a small letter waiting to be opened.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <Link
            href="/products"
            className="group mt-12 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink"
          >
            Explore the collection
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </Reveal>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0,
  );

  return (
    <div className="bg-parchment pb-32">
      <header className="border-b border-ink/10 bg-parchment-soft pb-12 pt-16 lg:pt-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              Your bag · 01 of 03
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 font-display text-[clamp(2.8rem,6.5vw,5rem)] font-light leading-[0.95] tracking-[-0.015em] text-ink">
              The bag, <em className="italic text-brand-gold">at a glance.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-[10px] uppercase tracking-[0.36em] text-ink/55">
              {items.length} {items.length === 1 ? "fragrance" : "fragrances"} held
            </p>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto max-w-[1400px] px-5 pt-16 sm:px-8 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-20">
          <ul className="border-t border-ink/10">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={{
                  variantId: item.variantId,
                  productName: item.variant.product.name,
                  productSlug: item.variant.product.slug,
                  size: item.variant.size,
                  price: item.variant.price,
                  quantity: item.quantity,
                  stock: item.variant.stock,
                  imageUrl: item.variant.product.images[0] ?? null,
                }}
              />
            ))}
          </ul>

          <aside className="h-fit border border-ink/12 bg-parchment-soft p-8 lg:sticky lg:top-24">
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
              Subtotal
            </p>
            <p className="mt-3 font-display text-[3rem] font-light leading-none tabular-nums text-ink">
              {formatSLE(subtotal)}
            </p>
            <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-ink/55">
              Delivery calculated at the next step
            </p>

            <Link
              href="/checkout"
              className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink"
            >
              Proceed to checkout
              <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </Link>

            <Link
              href="/products"
              className="mt-5 block text-center text-[10px] uppercase tracking-[0.32em] text-ink/55 underline-offset-4 transition-colors hover:text-ink hover:underline"
            >
              Continue browsing the archive
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
