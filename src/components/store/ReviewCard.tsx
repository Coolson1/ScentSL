import { format } from "date-fns";

import { StarRatingDisplay } from "./StarRating";

type Props = {
  review: {
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: { name: string | null };
  };
};

export function ReviewCard({ review }: Props) {
  return (
    <article className="border-b border-ink/12 py-8 last:border-b-0">
      <header className="flex flex-wrap items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-display text-2xl font-light text-ink">
              {review.user.name ?? "An anonymous reader"}
            </p>
            <span className="rounded-full border border-brand-moss/30 bg-brand-moss/10 px-2.5 py-0.5 text-[9px] uppercase tracking-[0.2em] font-medium text-brand-moss">
              Verified Reader
            </span>
          </div>
          <p className="mt-1 text-[10px] uppercase tracking-[0.32em] text-ink/75">
            {format(review.createdAt, "d MMMM yyyy")}
          </p>
        </div>
        <StarRatingDisplay value={review.rating} size="sm" />
      </header>
      {review.comment && (
        <p className="mt-5 font-serif text-base leading-relaxed text-ink/80">
          &ldquo;{review.comment}&rdquo;
        </p>
      )}
    </article>
  );
}
