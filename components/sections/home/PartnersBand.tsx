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
      const copyW = firstCopyRef.current?.offsetWidth;
      const containerW = viewportRef.current?.offsetWidth;
      if (!copyW || !containerW) return;
      setCopies(Math.max(2, Math.ceil(containerW / copyW) + 1));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [items]);

  useAnimationFrame((_, delta) => {
    if (reduce || paused.current) return;
    const copyW = firstCopyRef.current?.offsetWidth;
    if (!copyW) return;
    let next = x.get() + (dir * SPEED_PX_PER_S * delta) / 1000;
    if (next <= -copyW) next += copyW;
    if (next > 0) next -= copyW;
    x.set(next);
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
