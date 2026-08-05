"use client";

import { motion, useReducedMotion } from "framer-motion";
import { entranceVariants, staggerContainerVariants } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Standard Framer entrance: y 24 → 0, fade, once, as soon as the element
 * enters the viewport. A fractional threshold breaks on containers taller
 * than the viewport (a tall grid can never reach even 15% visibility), so
 * reveals use amount "some"; the 40% token belongs to counters only.
 */
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
      viewport={{ once: true, amount: "some" }}
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
      viewport={{ once: true, amount: "some" }}
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
