"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { entranceVariants, staggerContainerVariants } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * Standard Framer entrance: y 24 → 0, fade, once, as soon as the element
 * enters the viewport.
 *
 * FAIL-SAFE: content must never stay hidden because an IntersectionObserver
 * didn't fire (observed twice in the field). A hard timeout forces the
 * visible state ~2.5s after mount — worst case the flourish is skipped,
 * never the content.
 */
const FORCE_VISIBLE_MS = 2500;

function useRevealVisible() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: "some" });
  const [forced, setForced] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setForced(true), FORCE_VISIBLE_MS);
    return () => clearTimeout(t);
  }, []);
  return { ref, visible: inView || forced };
}

export function Reveal({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const { ref, visible } = useRevealVisible();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={entranceVariants}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
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
  const { ref, visible } = useRevealVisible();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainerVariants}
      initial="hidden"
      animate={visible ? "visible" : "hidden"}
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
