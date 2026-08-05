"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";
import { hoverLift } from "@/lib/motion";

/**
 * Dark surface card: ink-800, hairline border, tight radius.
 * `lift` opts into the standard Framer hover lift.
 */
export function Card({
  lift = false,
  className,
  children,
}: {
  lift?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={lift && !reduce ? hoverLift : undefined}
      className={cn(
        "rounded-card border border-ink-700 bg-ink-800 p-6",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
