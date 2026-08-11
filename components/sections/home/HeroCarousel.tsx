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
 * Full-bleed hero: the V2 showreel plays as a silent full-screen backdrop
 * (desktop + mobile cuts, webm with mp4 fallback for Safari) beneath the
 * rotating headlines. The s1 photo is the base layer until the video is
 * ready — and the permanent backdrop under reduced motion or playback
 * failure. The only thing on the site allowed to loop.
 */
export function HeroCarousel() {
  const t = useTranslations("home.hero");
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [cycled, setCycled] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setCycled(true);
      setIndex((i) => (i + 1) % SLIDE_KEYS.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, []);

  const key = SLIDE_KEYS[index];
  const animateIn = cycled && !reduce;

  return (
    <section className="relative flex min-h-0 flex-1 items-end overflow-hidden border-b border-ink-700">
      {/* Base photo — SSR-visible (LCP), stays if video can't play */}
      <div className="absolute inset-0">
        <Image
          src={heroImages.s1.src}
          alt={t("slides.s1.alt")}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Showreel backdrop (client-only, skipped under reduced motion) */}
      {!reduce && <HeroVideo />}

      {/* Legibility scrim */}
      <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(10,10,11,0.78),rgba(10,10,11,0.35)_55%,rgba(10,10,11,0.85))]" />

      {/* Copy overlay. Every row below has a RESERVED height (lh-unit
          boxes for the text rows), so the block's total height is a
          constant per breakpoint — slide/locale content changes cannot
          move the layout. */}
      <div className="relative z-10 w-full pb-10 pt-6">
        <Container>
          {cycled ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={key}
                initial={animateIn ? { opacity: 0, y: 24 } : false}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-4xl"
              >
                <SlideCopy slideKey={key} />
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="max-w-4xl">
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

function HeroVideo() {
  // Pick the cut after mount so only one file downloads.
  const [variant, setVariant] = useState<"desktop" | "mobile" | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setVariant(window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop");
  }, []);

  if (!variant || failed) return null;
  const base = variant === "mobile" ? "/videos/showreel-mobile" : "/videos/showreel";

  return (
    <video
      aria-hidden
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      onCanPlay={() => setReady(true)}
      onError={() => setFailed(true)}
      className={cn(
        "absolute inset-0 size-full object-cover transition-opacity duration-700",
        ready ? "opacity-100" : "opacity-0",
      )}
    >
      <source src={`${base}.webm`} type="video/webm" />
      <source src={`${base}.mp4`} type="video/mp4" />
    </video>
  );
}

/**
 * Every row here has a reserved, content-independent height: the title
 * lives in a 4-line box (lh units resolve against text-display's own
 * line-height), the sub in a 3-line box (2 on md+). Longer strings
 * line-clamp inside their reserve instead of pushing the layout — the
 * first screen's geometry must never depend on which slide is showing.
 */
function SlideCopy({ slideKey }: { slideKey: (typeof SLIDE_KEYS)[number] }) {
  const t = useTranslations("home.hero");
  return (
    <>
      <div className="flex h-[5lh] items-end font-display text-display font-bold sm:h-[4lh]">
        <h1 className="line-clamp-5 text-balance sm:line-clamp-4">
          {t(`slides.${slideKey}.title`)}
        </h1>
      </div>
      <div className="mt-4 h-[3lh] max-w-xl text-h3 text-fg-muted md:h-[2lh]">
        <p className="line-clamp-3 md:line-clamp-2">
          {t(`slides.${slideKey}.sub`)}
        </p>
      </div>
      <Button href="/booking" className="mt-8">
        {t("cta")}
      </Button>
    </>
  );
}
