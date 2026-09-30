"use client";

import { motion } from "motion/react";
import { questions } from "@/lib/quiz-logic";
import { Button } from "@/components/ui/button";
import { RevealItem, RevealStagger } from "@/components/motion/RevealStagger";

export function QuizQuestion({
  questionId,
  onSelect,
}: {
  questionId: number;
  onSelect: (value: string) => void;
}) {
  const question = questions.find((q) => q.id === questionId);
  if (!question) return null;

  const progressPercent = (questionId / questions.length) * 100;

  return (
    <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-5 sm:mb-8"
      >
        <div className="flex items-center justify-between">
          <span className="text-[9px] uppercase tracking-[0.35em] text-brand-gold sm:text-[10px] sm:tracking-[0.5em]">
            Question {questionId} of {questions.length}
          </span>
          <span className="font-mono text-xs text-ink/40">
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-ink/10">
          <motion.div
            className="h-full bg-brand-gold"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </motion.div>

      <RevealItem>
        <h2 className="font-display text-[clamp(1.5rem,4vw,2.8rem)] font-light leading-snug text-ink">
          {question.question}
        </h2>
        {question.subtitle && (
          <p className="mt-1.5 font-serif text-xs italic text-ink/70 sm:text-sm md:text-base">
            {question.subtitle}
          </p>
        )}
      </RevealItem>

      <RevealStagger className="mt-6 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4" stagger={0.08}>
        {question.options.map((option) => (
          <motion.div
            key={option.value}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Button
              variant="goldOutline"
              size="xl"
              onClick={() => onSelect(option.value)}
              className="group h-auto w-full flex-col items-start justify-start p-4 text-left whitespace-normal break-words transition-all duration-300 hover:border-brand-gold hover:bg-brand-gold hover:text-ink sm:p-5 md:p-6"
            >
              <span className="font-display text-sm font-normal tracking-wide sm:text-base md:text-lg">
                {option.label}
              </span>
              {option.description && (
                <span className="mt-1 font-serif text-xs leading-normal text-ink/70 group-hover:text-ink/90 sm:mt-1.5 sm:text-sm">
                  {option.description}
                </span>
              )}
            </Button>
          </motion.div>
        ))}
      </RevealStagger>
    </div>
  );
}
