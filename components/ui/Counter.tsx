"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/cn";
import { COUNTER_DURATION, EASE_OUT, VIEWPORT_AMOUNT } from "@/lib/motion";

/**
 * Count-up numeral: 0 → value over 1.6s when 40% in view, once.
 * Western numerals always (design rule — no Eastern Arabic digits).
 */
export function Counter({
  value,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: VIEWPORT_AMOUNT });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: COUNTER_DURATION,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span
      ref={ref}
      dir="ltr"
      className={cn("font-display font-bold text-sk-red tabular-nums", className)}
    >
      {prefix}
      {display.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
