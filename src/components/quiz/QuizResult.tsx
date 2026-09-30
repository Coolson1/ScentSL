"use client";

import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";

import { categoryDescriptions, calculateScores, getTopCategories } from "@/lib/quiz-logic";
import type { QuizAnswer } from "@/lib/quiz-logic";
import { Button } from "@/components/ui/button";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  categoryName?: string;
  matchedNotes?: string[];
  matchScore?: number;
};

export function QuizResult({
  answers,
  userId,
  onRetake,
}: {
  answers: QuizAnswer[];
  userId: string;
  onRetake?: () => void;
}) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [matchedNotes, setMatchedNotes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Synchronously compute initial top category from answers to avoid any wrong category flash
  const clientPrimaryCategory = useMemo(() => {
    if (!answers || answers.length === 0) return null;
    const scores = calculateScores(answers);
    const top = getTopCategories(scores, 1);
    return top[0] || null;
  }, [answers]);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch("/api/find-your-scent/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers, userId }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to fetch recommendations");
        }
        setRecommendations(data.products || []);
        setCategories(data.categories || []);
        setMatchedNotes(data.matchedNotes || []);
      } catch (e) {
        console.error("Quiz recommendation error:", e);
        setError(e instanceof Error ? e.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, [answers, userId]);

  const primaryCategory = categories[0] || clientPrimaryCategory || "Fragrance Profile";
  const description = categoryDescriptions[primaryCategory] || {
    title: primaryCategory,
    description: "A refined and captivating scent profile matched to your unique preferences.",
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-parchment px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center max-w-md"
        >
          <p className="font-display text-xl italic text-ink/80 sm:text-2xl">
            Curating your bespoke perfume recommendations...
          </p>
          <motion.div
            className="mt-6 h-0.5 w-36 bg-gradient-to-r from-transparent via-brand-gold to-transparent"
            animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-parchment pb-20 sm:pb-32">
      <header className="border-b border-ink/10 bg-parchment-soft py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between gap-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-[9px] uppercase tracking-[0.35em] text-brand-gold sm:text-[10px] sm:tracking-[0.5em]"
            >
              Your Olfactory Profile
            </motion.p>
            {onRetake && (
              <button
                onClick={onRetake}
                className="text-xs uppercase tracking-widest text-ink/70 underline-offset-4 hover:text-brand-gold hover:underline"
              >
                Retake Quiz
              </button>
            )}
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-3 font-display text-[clamp(1.8rem,5vw,4.2rem)] font-light leading-[1] tracking-[-0.015em] text-ink sm:mt-4"
          >
            Your Signature Category:{" "}
            <em className="italic text-brand-gold">{description.title}</em>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-3 font-serif text-sm leading-relaxed text-ink/75 sm:mt-5 sm:max-w-2xl sm:text-base md:text-lg"
          >
            {description.description}
          </motion.p>

          {matchedNotes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-6 pt-5 border-t border-ink/10 sm:mt-8 sm:pt-6"
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-ink/50 block mb-2.5">
                Key Matched Scent Notes
              </span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {matchedNotes.map((note) => (
                  <span
                    key={note}
                    className="inline-flex items-center gap-1 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-2.5 py-0.5 text-xs font-serif text-ink sm:px-3 sm:py-1"
                  >
                    <span className="size-1.5 rounded-full bg-brand-gold" />
                    {note}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-[1200px] px-4 sm:mt-14 sm:px-8 lg:px-12">
        {error && (
          <div className="flex flex-col items-center py-12 text-center text-destructive sm:py-20">
            <p className="font-display text-lg italic sm:text-2xl">{error}</p>
            {onRetake && (
              <Button variant="goldOutline" className="mt-6" onClick={onRetake}>
                Try Again
              </Button>
            )}
          </div>
        )}
        {!error && recommendations.length > 0 && (
          <div className="space-y-8 sm:space-y-12 md:space-y-14">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1">
                <p className="text-[9px] uppercase tracking-[0.35em] text-brand-gold sm:text-[10px] sm:tracking-[0.4em] whitespace-nowrap">
                  Recommended Perfumes ({recommendations.length})
                </p>
                <span className="inline-block h-px flex-1 bg-ink/15" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 xs:grid-cols-1 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
              {recommendations.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/products/${product.slug}`} className="group block h-full flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-parchment-deep border border-ink/5">
                        {product.images?.[0] && (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                          />
                        )}
                        {product.categoryName && (
                          <span className="absolute top-2.5 left-2.5 rounded-full bg-parchment/90 backdrop-blur-md px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-ink/80 font-medium">
                            {product.categoryName}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 sm:mt-4">
                        <h3 className="font-display text-base text-ink transition-colors group-hover:text-brand-gold sm:text-lg lg:text-xl">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="mt-1 font-serif text-xs leading-relaxed text-ink/65 line-clamp-2 sm:mt-2 sm:text-sm">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {product.matchedNotes && product.matchedNotes.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-ink/5 flex flex-wrap gap-1">
                        {product.matchedNotes.slice(0, 4).map((n) => (
                          <span
                            key={n}
                            className="text-[10px] font-serif text-brand-gold bg-brand-gold/5 px-2 py-0.5 rounded border border-brand-gold/20"
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 border-t border-ink/10">
              {onRetake && (
                <Button variant="goldOutline" size="xl" onClick={onRetake} className="w-full sm:w-auto">
                  Retake Quiz
                </Button>
              )}
              <Button variant="gold" size="xl" render={<Link href="/products" />} className="w-full sm:w-auto">
                Explore All Fragrances
              </Button>
            </div>
          </div>
        )}
        {!error && recommendations.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center sm:py-20">
            <p className="font-display text-lg italic text-ink/65 sm:text-2xl">
              No perfumes found. Please explore our full collection or retake the quiz.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {onRetake && (
                <Button variant="goldOutline" onClick={onRetake} className="w-full sm:w-auto">
                  Retake Quiz
                </Button>
              )}
              <Button variant="gold" render={<Link href="/products" />} className="w-full sm:w-auto">
                Browse All
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

