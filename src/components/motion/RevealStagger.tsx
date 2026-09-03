"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { createElement, type ReactNode } from "react";

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

const parentVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 1, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

type ParentTag = "div" | "section" | "ul" | "ol";
type ItemTag = "div" | "li" | "article" | "section" | "span" | "p" | "h1" | "h2" | "h3";

type RevealStaggerProps = {
  children: ReactNode;
  className?: string;
  once?: boolean;
  stagger?: number;
  as?: ParentTag;
};

export function RevealStagger({
  children,
  className,
  once = true,
  stagger,
  as = "div",
}: RevealStaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return createElement(as, { className }, children);
  }

  const Tag = motion[as] as typeof motion.div;

  const variants: Variants = stagger
    ? {
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: 0.05 } },
      }
    : parentVariants;

  return (
    <Tag
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "0px" }}
      variants={variants}
      className={className}
    >
      {children}
    </Tag>
  );
}

type RevealItemProps = {
  children: ReactNode;
  className?: string;
  as?: ItemTag;
};

export function RevealItem({ children, className, as = "div" }: RevealItemProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return createElement(as, { className }, children);
  }

  const Tag = motion[as] as typeof motion.div;

  return (
    <Tag
      variants={itemVariants}
      // Ensure content is visible in the server-rendered HTML before JS hydrates
      style={{ opacity: 1 }}
      className={className}
    >
      {children}
    </Tag>
  );
}
