import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ImageGallery } from "@/components/store/ImageGallery";
import { ProductActions } from "@/components/store/ProductActions";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ReviewCard } from "@/components/store/ReviewCard";
import { ReviewForm } from "@/components/store/ReviewForm";
import { StarRatingDisplay } from "@/components/store/StarRating";
import { Reveal } from "@/components/motion/Reveal";
import { Ornament } from "@/components/store/Ornament";

export const revalidate = 30;

// Three-tier fragrance pyramid — decorative editorial detail.
// Could be data-driven later; for now we synthesize sensible defaults
// from the category and product name.
function notesPyramid(productName: string, categoryName: string) {
  const lower = (productName + " " + categoryName).toLowerCase();
  if (lower.includes("oud"))
    return {
      top: ["Saffron", "Pink pepper"],
      heart: ["Rose", "Cardamom"],
      base: ["Oud", "Sandalwood", "Leather"],
    };
  if (lower.includes("floral"))
    return {
      top: ["Bergamot", "Pear blossom"],
      heart: ["Jasmine sambac", "Tuberose"],
      base: ["White musk", "Cedar"],
    };
  if (lower.includes("amber"))
    return {
      top: ["Mandarin", "Cinnamon"],
      heart: ["Tobacco", "Honey"],
      base: ["Amber", "Vanilla", "Tonka"],
    };
  return {
    top: ["Bergamot", "Cardamom"],
    heart: ["Jasmine", "Rose"],
    base: ["Vetiver", "Musk"],
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      variants: { orderBy: { price: "asc" } },
      category: true,
      reviews: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!product) notFound();

  const userId = session?.user?.id ?? null;
  const [existingReview, isWishlisted, related] = await Promise.all([
    userId
      ? prisma.review.findUnique({
          where: { userId_productId: { userId, productId: product.id } },
        })
      : Promise.resolve(null),
    userId
      ? prisma.wishlistItem
          .findUnique({
            where: { userId_productId: { userId, productId: product.id } },
          })
          .then(Boolean)
      : Promise.resolve(false),
    prisma.product.findMany({
      where: {
        isActive: true,
        categoryId: product.categoryId,
        NOT: { id: product.id },
      },
      include: {
        variants: { select: { price: true, stock: true } },
        category: { select: { name: true } },
      },
      take: 4,
    }),
  ]);

  const ratingsCount = product.reviews.length;
  const averageRating =
    ratingsCount > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / ratingsCount
      : 0;

  const ratingBuckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews.filter((r) => r.rating === star).length,
  }));

  const pyramid = notesPyramid(product.name, product.category.name);

  return (
    <div className="bg-parchment pb-32">
      {/* Breadcrumb */}
      <nav className="mx-auto flex max-w-[1400px] items-center gap-3 px-5 pt-12 text-[10px] uppercase tracking-[0.32em] text-ink/55 sm:px-8 lg:px-12">
        <Link href="/" className="hover:text-ink">
          Maison
        </Link>
        <span className="text-ink/25">·</span>
        <Link href="/products" className="hover:text-ink">
          Collection
        </Link>
        <span className="text-ink/25">·</span>
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-ink"
        >
          {product.category.name}
        </Link>
        <span className="text-ink/25">·</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      {/* HERO */}
      <section className="relative mx-auto mt-10 grid max-w-[1400px] grid-cols-1 items-start gap-12 px-5 sm:px-8 lg:grid-cols-12 lg:gap-20 lg:px-12">
        <Ornament
          variant="botanical"
          className="pointer-events-none absolute -left-12 top-12 hidden h-[420px] w-[420px] text-brand-gold/22 lg:block"
        />

        <div className="lg:col-span-7">
          <ImageGallery images={product.images} name={product.name} categorySlug={product.category?.slug ?? null} />
        </div>

        <div className="space-y-9 lg:col-span-5 lg:pt-6">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              Chapitre · {product.category.name}
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <h1 className="font-display text-[clamp(2.6rem,5vw,4.4rem)] font-light leading-[0.96] tracking-[-0.015em] text-ink">
              {product.name}
            </h1>
          </Reveal>

          {ratingsCount > 0 && (
            <Reveal delay={0.12}>
              <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink/70">
                <StarRatingDisplay value={averageRating} size="sm" />
                <span>
                  {averageRating.toFixed(1)} · {ratingsCount}{" "}
                  {ratingsCount === 1 ? "letter" : "letters"}
                </span>
              </div>
            </Reveal>
          )}

          <Reveal delay={0.16}>
            <p className="font-serif text-lg leading-relaxed text-ink/80">
              {product.description}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="inline-flex items-center gap-2 rounded-full border border-ink/10 bg-parchment-soft px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-ink/70">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <span>Sold by: Verified ScentSL Partner</span>
            </div>
          </Reveal>

          <Reveal delay={0.22}>
            <ProductActions
              productId={product.id}
              productName={product.name}
              variants={product.variants.map((v) => ({
                id: v.id,
                size: v.size,
                price: v.price,
                stock: v.stock,
              }))}
              isAuthenticated={Boolean(userId)}
              isInWishlist={isWishlisted}
            />
          </Reveal>
        </div>
      </section>

      {/* NOTES PYRAMID */}
      <section className="relative mt-32 border-y border-ink/10 bg-parchment-soft py-24 lg:py-32">
        <div className="mx-auto max-w-3xl px-5 text-center sm:px-8">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
              The Composition
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,3.4rem)] font-light italic leading-[1.05] text-ink">
              a pyramid of notes
            </h2>
          </Reveal>

          <div className="mt-16 space-y-10">
            <NoteRow label="Top" notes={pyramid.top} delay={0.16} />
            <NoteRow label="Heart" notes={pyramid.heart} delay={0.26} accent />
            <NoteRow label="Base" notes={pyramid.base} delay={0.36} />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto mt-24 max-w-[1400px] px-5 sm:px-8 lg:mt-32 lg:px-12">
        <Reveal>
          <div className="flex flex-col items-baseline gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
                Reader letters
              </p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,4.5vw,3.6rem)] font-light leading-[0.95] text-ink">
                What others have written
              </h2>
            </div>
            {ratingsCount > 0 && (
              <div className="flex items-baseline gap-4 text-[11px] uppercase tracking-[0.32em] text-ink/65">
                <span className="font-display text-5xl font-light leading-none text-ink">
                  {averageRating.toFixed(1)}
                </span>
                <span className="flex flex-col gap-1">
                  <StarRatingDisplay value={averageRating} size="sm" />
                  <span>
                    {ratingsCount} {ratingsCount === 1 ? "letter" : "letters"}
                  </span>
                </span>
              </div>
            )}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-[280px_1fr] lg:gap-20">
          <Reveal delay={0.06}>
            <div className="lg:sticky lg:top-24">
              {ratingsCount > 0 ? (
                <ul className="space-y-3">
                  {ratingBuckets.map(({ star, count }) => {
                    const pct =
                      ratingsCount === 0 ? 0 : (count / ratingsCount) * 100;
                    return (
                      <li
                        key={star}
                        className="flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink/65"
                      >
                        <span className="w-3 font-display text-base text-ink">
                          {star}
                        </span>
                        <div className="h-px flex-1 bg-ink/15">
                          <div
                            className="h-px bg-brand-gold transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right font-display text-base normal-case tracking-normal text-ink/85">
                          {count}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="font-serif text-base italic text-ink/55">
                  No letters yet — the archive is quiet.
                </p>
              )}
            </div>
          </Reveal>

          <div>
            {session?.user?.id ? (
              existingReview ? (
                <div className="mb-10 border border-brand-gold/40 bg-brand-gold/8 p-6">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">
                    Your letter
                  </p>
                  <div className="mt-3">
                    <StarRatingDisplay
                      value={existingReview.rating}
                      size="sm"
                    />
                  </div>
                  {existingReview.comment && (
                    <p className="mt-4 font-serif text-base text-ink/85">
                      &ldquo;{existingReview.comment}&rdquo;
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-10">
                  <ReviewForm productId={product.id} />
                </div>
              )
            ) : (
              <p className="mb-10 border-l-2 border-brand-gold/50 bg-parchment-soft px-5 py-4 font-serif text-base italic text-ink/75">
                <Link
                  href={`/auth/signin?callbackUrl=/products/${product.slug}`}
                  className="underline-offset-4 hover:text-brand-gold hover:underline"
                >
                  Sign in
                </Link>{" "}
                to leave your letter.
              </p>
            )}

            {product.reviews.length > 0 ? (
              <div className="border-t border-ink/12">
                {product.reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <p className="font-serif text-base italic text-ink/55">
                Be the first to write about this fragrance.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section className="mx-auto mt-32 max-w-[1400px] px-5 sm:px-8 lg:px-12">
          <Reveal>
            <div className="mb-12 flex flex-col items-baseline justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-[10px] uppercase tracking-[0.5em] text-brand-gold">
                  Adjacent chapters
                </p>
                <h2 className="mt-3 font-display text-[clamp(2rem,4vw,3rem)] font-light leading-[0.95] text-ink">
                  You may also be drawn to
                </h2>
              </div>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="group flex items-center gap-3 text-[11px] uppercase tracking-[0.32em] text-ink/70 transition-colors hover:text-ink"
              >
                The {product.category.name} chapter
                <span className="inline-block h-px w-10 bg-ink/40 transition-all duration-500 group-hover:w-14 group-hover:bg-brand-gold" />
              </Link>
            </div>
          </Reveal>

          <ProductGrid products={related} columns={4} />
        </section>
      )}
    </div>
  );
}

function NoteRow({
  label,
  notes,
  delay = 0,
  accent = false,
}: {
  label: string;
  notes: string[];
  delay?: number;
  accent?: boolean;
}) {
  return (
    <Reveal delay={delay}>
      <div className="flex flex-col items-center gap-3">
        <p
          className={`text-[10px] uppercase tracking-[0.4em] ${
            accent ? "text-brand-gold" : "text-ink/55"
          }`}
        >
          — {label} —
        </p>
        <p className="font-display text-[clamp(1.6rem,3.5vw,2.4rem)] font-light italic leading-tight text-ink">
          {notes.join(" · ")}
        </p>
      </div>
    </Reveal>
  );
}
