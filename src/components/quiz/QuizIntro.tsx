"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";

export function QuizIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className="bg-parchment pb-32">
      <header className="border-b border-ink/10 bg-parchment-soft pb-10 pt-10 sm:pt-12 sm:pb-12 lg:pt-24 lg:pb-12">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8 lg:px-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-[9px] uppercase tracking-[0.45em] text-brand-gold sm:text-[10px] sm:tracking-[0.5em]"
          >
            ScentSL
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-4 font-display text-[clamp(2.6rem,6vw,4.8rem)] font-light leading-[0.95] tracking-[-0.015em] text-ink"
          >
            Discover Your
            <br />
            <em className="italic text-brand-gold">Signature</em> Scent
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-4 max-w-lg font-serif text-base leading-relaxed text-ink/70 sm:mt-6 sm:max-w-xl sm:text-lg md:max-w-2xl"
          >
            Four questions to reveal the fragrance that speaks to your essence.
            Allow our maison to guide you to your olfactory identity.
          </motion.p>
        </div>
      </header>

      <div className="mx-auto mt-12 max-w-[1200px] px-5 sm:mt-16 sm:px-8 lg:mt-20 lg:px-12">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3, duration: 0.6 }}
           className="text-center"
         >
           <Button variant="gold" onClick={onStart} className="w-full px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base lg:text-lg whitespace-nowrap sm:whitespace-normal shrink">
             Begin Experience
           </Button>
         </motion.div>
      </div>
    </div>
  );
}