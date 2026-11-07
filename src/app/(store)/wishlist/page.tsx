import Link from "next/link";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistRow } from "@/components/store/WishlistRow";
import { Ornament } from "@/components/store/Ornament";
import { Reveal } from "@/components/motion/Reveal";
import { RevealItem, RevealStagger } from "@/components/motion/RevealStagger";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          variants: { orderBy: { price: "asc" } },
        },
      },
    },
    orderBy: { product: { name: "asc" } },
  });

  if (items.length === 0) {
    return (
      <div className="relative mx-auto flex max-w-2xl flex-col items-center justify-center px-5 py-32 text-center sm:px-8">
        <Ornament
          variant="sprig"
          className="pointer-events-none absolute -right-6 top-16 hidden h-[240px] w-[180px] text-brand-gold/20 lg:block"
        />
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
            Your wishlist
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,6vw,4.4rem)] font-light leading-[1.02] tracking-[-0.01em] text-ink">
            Nothing yet,{" "}
            <em className="italic text-brand-gold">an empty journal.</em>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-md font-serif text-lg leading-relaxed text-ink/70">
            Save the fragrances you&apos;d like to revisit. They will be kept
            here, ready for the next chapter.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <Link
            href="/products"
            className="group mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 text-[11px] uppercase tracking-[0.32em] text-parchment transition-all duration-500 hover:bg-brand-gold hover:text-ink"
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

  return (
    <div className="bg-parchment pb-32">
      <header className="border-b border-ink/10 bg-parchment-soft pb-12 pt-16 lg:pt-24">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              Kept aside
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-4 font-display text-[clamp(2.6rem,6vw,4.8rem)] font-light leading-[0.95] tracking-[-0.015em] text-ink">
              Your <em className="italic text-brand-gold">wishlist</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 text-[10px] uppercase tracking-[0.36em] text-ink/55">
              {items.length} saved{" "}
              {items.length === 1 ? "fragrance" : "fragrances"}
            </p>
          </Reveal>
        </div>
      </header>

      <div className="mx-auto mt-16 max-w-[1400px] px-5 sm:px-8 lg:px-12">
        <RevealStagger
          className="grid grid-cols-1 gap-x-6 gap-y-14 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-16 lg:grid-cols-3"
          stagger={0.06}
        >
          {items.map(({ product }) => (
            <RevealItem key={product.id}>
              <WishlistRow
                productId={product.id}
                productSlug={product.slug}
                productName={product.name}
                imageUrl={product.images[0] ?? null}
                variants={product.variants.map((v) => ({
                  id: v.id,
                  size: v.size,
                  price: v.price,
                  stock: v.stock,
                }))}
              />
            </RevealItem>
          ))}
        </RevealStagger>
      </div>
    </div>
  );
}
