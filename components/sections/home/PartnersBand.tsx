"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { partners, type Partner } from "@/content/partners";
import { cn } from "@/lib/cn";

const SPEED_PX_PER_S = 32;

/**
 * Partner strip between the hero and the services rail. Renders nothing
 * at all until at least one entry in content/partners.ts is confirmed —
 * no empty state, no reserved space. One confirmed partner renders a
 * centred static lockup; two or more render a marquee that pauses on
 * hover and goes static under reduced motion.
 */
export function PartnersBand() {
  const confirmed = partners.filter((p) => p.confirmed);
  if (confirmed.length === 0) return null;
  if (confirmed.length === 1) return <SingleLockup partner={confirmed[0]} />;
  return <Marquee items={confirmed} />;
}

function Band({
  label,
  children,
  ...rest
}: { label: string; children: React.ReactNode } & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      aria-label={label}
      // Fixed 128px: the strip is the bottom row of the locked 100svh
      // first screen — its height must never derive from content.
      className="flex h-32 shrink-0 flex-col justify-center border-b border-ink-700"
      {...rest}
    >
      {children}
    </section>
  );
}

/** Exactly one confirmed partner: a centred lockup, never a scroller. */
function SingleLockup({ partner }: { partner: Partner }) {
  const t = useTranslations("home.partners");
  return (
    <Band label={t("aria")}>
      <div className="flex flex-col items-center gap-2 px-(--spacing-gutter)">
        <PartnerLogo partner={partner} />
        {t.has(`items.${partner.id}.line`) && (
          <p className="text-small text-fg-muted">{t(`items.${partner.id}.line`)}</p>
        )}
      </div>
    </Band>
  );
}

function Marquee({ items }: { items: Partner[] }) {
  const t = useTranslations("home.partners");
  const reduce = useReducedMotion();
  const locale = useLocale();
  const x = useMotionValue(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const firstCopyRef = useRef<HTMLUListElement>(null);
  const paused = useRef(false);
  // With a small roster, two copies of the logo list may not span a wide
  // screen — render however many copies cover the container, plus one
  // spare (the wrap distance), so the loop never shows a gap.
  const [copies, setCopies] = useState(2);
  // The strip drifts in reading direction: leftwards in LTR, rightwards
  // in RTL. The track itself is pinned to dir="ltr" so the wrap math is
  // one coordinate system regardless of locale.
  const dir = locale === "ar" ? 1 : -1;

  useEffect(() => {
    const measure = () => {
      const copyW = firstCopyRef.current?.getBoundingClientRect().width;
      const containerW = viewportRef.current?.offsetWidth;
      if (!copyW || !containerW) return;
      // +2: one copy is the wrap distance, one is spare, so the visible
      // window is always covered on both sides of the seam.
      setCopies(Math.max(2, Math.ceil(containerW / copyW) + 2));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  /**
   * Seamless infinite loop (2026-08-19 fix — the strip used to "reset"):
   * - the track position is kept in (-copyW, 0] with a modulo, never an
   *   `if` that can only correct one copy-width — after a tab switch or a
   *   hover pause the frame delta can exceed that and the strip jumped;
   * - the delta is clamped so a long frame moves at most ~50 ms worth;
   * - copyW is the EXACT fractional width (getBoundingClientRect), not the
   *   rounded offsetWidth, so the seam lands on the identical pixel every
   *   time. The logos are eager-loaded (see PartnerLogo) so every copy has
   *   the same width from the first frame.
   */
  useAnimationFrame((_, delta) => {
    if (reduce || paused.current) return;
    const copyW = firstCopyRef.current?.getBoundingClientRect().width;
    if (!copyW) return;
    const step = (dir * SPEED_PX_PER_S * Math.min(delta, 50)) / 1000;
    const next = x.get() + step;
    // Normalise into (-copyW, 0] — identical frame for every k·copyW.
    x.set(((next % copyW) - copyW) % copyW);
  });

  if (reduce) {
    // Static single row inside the fixed-height band; horizontal
    // scroll instead of wrapping so the 128px reserve always holds.
    return (
      <Band label={t("aria")}>
        <ul className="flex items-center gap-14 overflow-x-auto px-(--spacing-gutter)">
          {items.map((p) => (
            <li key={p.id} className="shrink-0">
              <PartnerLogo partner={p} />
            </li>
          ))}
        </ul>
      </Band>
    );
  }

  return (
    <Band
      label={t("aria")}
      onPointerEnter={() => (paused.current = true)}
      onPointerLeave={() => (paused.current = false)}
      onFocusCapture={() => (paused.current = true)}
      onBlurCapture={() => (paused.current = false)}
    >
      <div ref={viewportRef} dir="ltr" className="overflow-hidden">
        <motion.div style={{ x }} className="flex w-max items-center">
          {Array.from({ length: copies }, (_, copy) => (
            <ul
              key={copy}
              ref={copy === 0 ? firstCopyRef : undefined}
              aria-hidden={copy > 0 || undefined}
              className="flex items-center gap-14 pe-14"
            >
              {items.map((p) => (
                <li key={p.id} className="shrink-0">
                  <PartnerLogo partner={p} />
                </li>
              ))}
            </ul>
          ))}
        </motion.div>
      </div>
    </Band>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const t = useTranslations("home.partners");
  const img = (
    <Image
      src={partner.logo}
      alt={t(`items.${partner.id}.name`)}
      width={480}
      height={192}
      unoptimized
      // Eager: the marquee duplicates the row, and a lazy (unloaded) copy is
      // laid out from the generic 480×192 ratio, not the logo's own — copies
      // of different widths made the loop seam visibly jump.
      loading="eager"
      className={cn(
        // Box-constrain wide wordmarks (Jetour, Geely, Lexus…) so they
        // sit in the row at a sane size next to compact roundels.
        // Original colours, no filter overlay (Ibrahim, 2026-08-11).
        "h-12 w-auto max-w-44 object-contain md:h-14 md:max-w-52",
      )}
    />
  );
  if (!partner.url) return img;
  return (
    <a
      href={partner.url}
      target="_blank"
      rel="noopener noreferrer"
      className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sk-red"
    >
      {img}
    </a>
  );
}
