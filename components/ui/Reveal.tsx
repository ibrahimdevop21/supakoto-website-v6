"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  entranceVariants,
  staggerContainerVariants,
  VIEWPORT_AMOUNT,
} from "@/lib/motion";
import { cn } from "@/lib/cn";

/** Standard Framer entrance: y 24 → 0, fade, once, at 40% in view. */
export function Reveal({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={entranceVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: VIEWPORT_AMOUNT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered group: wrap children in <RevealItem>. 0.08s between children.
 */
export function RevealStagger({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={staggerContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: VIEWPORT_AMOUNT }}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={cn(className)} variants={entranceVariants}>
      {children}
    </motion.div>
  );
}
