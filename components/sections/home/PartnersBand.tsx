"use client";

import { useRef } from "react";
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
      className="border-b border-ink-700 py-10"
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
      <div className="flex flex-col items-center gap-3 px-(--spacing-gutter)">
        <PartnerLogo partner={partner} />
        <p className="text-small text-fg-muted">{t(`items.${partner.id}.line`)}</p>
      </div>
    </Band>
  );
}

function Marquee({ items }: { items: Partner[] }) {
  const t = useTranslations("home.partners");
  const reduce = useReducedMotion();
  const locale = useLocale();
  const x = useMotionValue(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  // The strip drifts in reading direction: leftwards in LTR, rightwards
  // in RTL. The track itself is pinned to dir="ltr" so the wrap math is
  // one coordinate system regardless of locale.
  const dir = locale === "ar" ? 1 : -1;

  useAnimationFrame((_, delta) => {
    if (reduce || paused.current || !trackRef.current) return;
    const half = trackRef.current.scrollWidth / 2;
    if (!half) return;
    let next = x.get() + (dir * SPEED_PX_PER_S * delta) / 1000;
    if (next <= -half) next += half;
    if (next > 0) next -= half;
    x.set(next);
  });

  if (reduce) {
    return (
      <Band label={t("aria")}>
        <ul className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6 px-(--spacing-gutter)">
          {items.map((p) => (
            <li key={p.id}>
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
      <div dir="ltr" className="overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex w-max items-center">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              aria-hidden={copy === 1 || undefined}
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
        "h-12 w-auto opacity-70 grayscale transition-[filter,opacity] duration-300 md:h-14",
        "hover:opacity-100 hover:grayscale-0",
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
