"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/cn";

const SLIDE_KEYS = ["s1", "s2", "s3", "s4", "s5"] as const;
const AUTOPLAY_MS = 6000;

/**
 * Full-bleed hero. The only thing on the site allowed to loop.
 * Ken Burns drift: 12s linear, scale 1 → 1.06 (design token).
 * Slide media are labelled placeholders until campaign photography lands.
 */
export function HeroCarousel() {
  const t = useTranslations("home.hero");
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDE_KEYS.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(id);
  }, []);

  const key = SLIDE_KEYS[index];

  return (
    <section className="relative flex min-h-[80svh] items-end overflow-hidden border-b border-ink-700">
      {/* Slide backdrop */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={key}
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-[linear-gradient(160deg,var(--color-ink-800),var(--color-ink-950)_60%,#1c0d0f)]"
            initial={reduce ? undefined : { scale: 1 }}
            animate={reduce ? undefined : { scale: 1.06 }}
            transition={{ duration: 12, ease: "linear" }}
          />
          <span className="absolute bottom-3 start-3 z-10 rounded-card bg-ink-950/80 px-2 py-1 text-eyebrow text-fg-subtle">
            {t("placeholderNote")}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Copy overlay */}
      <div className="relative z-10 w-full pb-20 pt-40">
        <Container>
          <AnimatePresence mode="wait">
            <motion.div
              key={key}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl"
            >
              <h1 className="font-display text-display font-bold text-balance">
                {t(`slides.${key}.title`)}
              </h1>
              <p className="mt-4 max-w-xl text-h3 text-fg-muted">
                {t(`slides.${key}.sub`)}
              </p>
              <Button href="/booking" className="mt-8">
                {t("cta")}
              </Button>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="mt-10 flex gap-2">
            {SLIDE_KEYS.map((k, i) => (
              <button
                key={k}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={t(`slides.${k}.title`)}
                aria-current={i === index}
                className={cn(
                  "h-1 rounded-full transition-all duration-300",
                  i === index ? "w-8 bg-sk-red" : "w-4 bg-ink-700 hover:bg-fg-subtle",
                )}
              />
            ))}
          </div>
        </Container>
      </div>
    </section>
  );
}
