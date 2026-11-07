"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, type ReactNode } from "react";

type ParallaxImageProps = {
  children: ReactNode;
  /** % of element height to drift, 0 to 20 typical */
  amount?: number;
  className?: string;
};

export function ParallaxImage({
  children,
  amount = 8,
  className,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${amount}%`, `-${amount}%`],
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      {reduce ? (
        <div className="size-full">{children}</div>
      ) : (
        <motion.div style={{ y }} className="size-full">
          {children}
        </motion.div>
      )}
    </div>
  );
}
