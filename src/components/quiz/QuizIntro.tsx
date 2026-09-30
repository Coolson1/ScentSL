"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function QuizIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="bg-parchment pb-20 sm:pb-32">
      <header className="border-b border-ink/10 bg-parchment-soft py-10 sm:py-16 lg:py-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-8 lg:px-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-[9px] uppercase tracking-[0.45em] text-brand-gold sm:text-[10px] sm:tracking-[0.5em]"
          >
            ScentSL Perfume Finder
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-3 font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-light leading-[1] tracking-[-0.015em] text-ink sm:mt-4"
          >
            Find Your
            <br />
            <em className="italic text-brand-gold">Perfect</em> Perfume
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-3 max-w-lg font-serif text-sm leading-relaxed text-ink/75 sm:mt-6 sm:max-w-xl sm:text-lg md:max-w-2xl"
          >
            Answer 4 quick and easy questions to discover the best perfume recommendations tailored to your style and favorite scents.
          </motion.p>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-[1200px] px-4 sm:mt-14 sm:px-8 lg:mt-16 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex justify-start sm:justify-center"
        >
          <Button
            variant="gold"
            size="xl"
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 text-sm font-medium tracking-widest sm:text-base"
          >
            Take The Quiz
          </Button>
        </motion.div>
      </div>
    </div>
  );
}