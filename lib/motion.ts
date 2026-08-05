import type { Variants } from "framer-motion";

/** docs/DESIGN-TOKENS.md — Motion. Framer Motion is the only animation layer. */

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const DURATION_ENTRANCE = 0.6;
export const DURATION_LIFT = 0.25;
export const STAGGER_CHILDREN = 0.08;

/** Counter: count up over 1.6s, trigger at 40% viewport. */
export const COUNTER_DURATION = 1.6;
export const VIEWPORT_AMOUNT = 0.4;

export const entranceVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION_ENTRANCE, ease: EASE_OUT },
  },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER_CHILDREN },
  },
};

export const hoverLift = {
  y: -4,
  transition: { duration: DURATION_LIFT, ease: "easeOut" },
} as const;
