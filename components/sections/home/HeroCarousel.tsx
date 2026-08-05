"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { heroImages } from "@/content/gallery";
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
  // First slide must be visible in SSR HTML (it is the LCP element) —
  // entrance animations only run once the carousel has cycled.
  const [cycled, setCycled] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setCycled(true);
      setIndex((i) => (i + 1) % SLIDE_KEYS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  const animateIn = cycled && !reduce;

  const key = SLIDE_KEYS[index];

  return (
    <section className="relative flex min-h-[80svh] items-end overflow-hidden border-b border-ink-700">
      {/* Slide backdrop. The static branch (pre-cycle) keeps the SSR DOM
          untouched through hydration — an AnimatePresence remount would
          register a late LCP entry for the hero. */}
      {cycled ? (
        <AnimatePresence mode="popLayout">
          <motion.div
            key={key}
            className="absolute inset-0"
            initial={animateIn ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Backdrop slideKey={key} reduce={reduce} alt={t(`slides.${key}.alt`)} />
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="absolute inset-0">
          <Backdrop slideKey={key} reduce={reduce} alt={t(`slides.${key}.alt`)} />
        </div>
      )}

      {/* Copy overlay */}
      <div className="relative z-10 w-full pb-20 pt-40">
        <Container>
          {cycled ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={key}
                initial={animateIn ? { opacity: 0, y: 24 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl"
              >
                <SlideCopy slideKey={key} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="max-w-2xl">
              <SlideCopy slideKey={key} />
            </div>
          )}

          {/* Dots */}
          <div className="mt-10 flex gap-2">
            {SLIDE_KEYS.map((k, i) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setCycled(true);
                  setIndex(i);
                }}
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

function Backdrop({
  slideKey,
  reduce,
  alt,
}: {
  slideKey: keyof typeof heroImages;
  reduce: boolean | null;
  alt: string;
}) {
  return (
    <>
      <motion.div
        className="absolute inset-0"
        initial={reduce ? undefined : { scale: 1 }}
        animate={reduce ? undefined : { scale: 1.06 }}
        transition={{ duration: 12, ease: "linear" }}
      >
        <Image
          src={heroImages[slideKey].src}
          alt={alt}
          fill
          priority={slideKey === "s1"}
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>
      {/* Legibility scrim over the photo */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(10,10,11,0.78),rgba(10,10,11,0.35)_55%,rgba(10,10,11,0.85))]" />
    </>
  );
}

function SlideCopy({ slideKey }: { slideKey: (typeof SLIDE_KEYS)[number] }) {
  const t = useTranslations("home.hero");
  return (
    <>
      <h1 className="font-display text-display font-bold text-balance">
        {t(`slides.${slideKey}.title`)}
      </h1>
      <p className="mt-4 max-w-xl text-h3 text-fg-muted">
        {t(`slides.${slideKey}.sub`)}
      </p>
      <Button href="/booking" className="mt-8">
        {t("cta")}
      </Button>
    </>
  );
}
