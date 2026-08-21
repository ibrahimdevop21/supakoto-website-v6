"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  galleryCategories,
  galleryItems,
  type GalleryCategory,
  type GalleryItem,
} from "@/content/gallery";
import { Lightbox } from "@/components/ui/Lightbox";
import { pageLoadSeed, seededShuffle } from "@/lib/shuffle";
import { cn } from "@/lib/cn";

/**
 * Real-estate style viewer (Phase 20, replaces the grid): one main stage,
 * prev/next, a scrollable thumbnail strip, fullscreen via the shared
 * Lightbox. Direction of travel follows the reading direction — in RTL
 * "next" moves LEFT (keyboard and swipe are mapped physically→logically at
 * event time, same convention as Lightbox). The item order is shuffled
 * on every full page load (lib/shuffle.ts) so each visit sees fresh
 * work, but never reshuffles mid-browse (filtering, client-side nav).
 *
 * Perf at a 240-image library: current image eager, prev/next preloaded
 * via hidden eager images, thumbnails lazy (96px), nothing else fetched.
 */

const isRtl = () =>
  typeof document !== "undefined" && document.documentElement.dir === "rtl";

export function GalleryViewer() {
  const t = useTranslations("gallery");
  const tServices = useTranslations("services.items");
  const reduce = useReducedMotion();

  const [items, setItems] = useState<readonly GalleryItem[]>(galleryItems);
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  // Shuffled per page load, applied after hydration (no SSR mismatch).
  // The seed lives in module scope: a refresh reshuffles, client-side
  // navigation within the visit does not (lib/shuffle.ts).
  useEffect(() => {
    setItems(seededShuffle(galleryItems, pageLoadSeed()));
    setIndex(0);
  }, []);

  const filtered = useMemo(
    () =>
      filter === "all" ? items : items.filter((i) => i.category === filter),
    [items, filter],
  );

  const current = filtered[index];
  const count = filtered.length;

  const filterLabel = (c: GalleryCategory | "all") =>
    c === "all" || c === "video" ? t(`filters.${c}`) : tServices(`${c}.name`);

  const step = (delta: number) =>
    setIndex((i) => (count === 0 ? 0 : (i + delta + count) % count));

  // Physical arrow keys → logical prev/next, same mapping as Lightbox.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(isRtl() ? 1 : -1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(isRtl() ? -1 : 1);
    }
  };

  // Swipe: the content follows the finger; the incoming image arrives from
  // the reading-direction side. dx > 0 (finger moved right) is "next" in RTL.
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    const forward = isRtl() ? dx > 0 : dx < 0;
    step(forward ? 1 : -1);
  };

  // Keep the active thumbnail in view as the index moves.
  const stripRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !current) return;
    strip
      .querySelector(`[data-thumb="${current.id}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [current]);

  const neighbours =
    count > 1 && current
      ? [filtered[(index + 1) % count], filtered[(index - 1 + count) % count]]
          .filter((n): n is Extract<GalleryItem, { kind: "image" }> => n.kind === "image")
          .filter((n) => n.id !== current.id)
      : [];

  return (
    <div>
      {/* Filters — derived from the service catalogue (content/gallery.ts). */}
      <div className="flex flex-wrap gap-2" role="group">
        {galleryCategories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setFilter(c);
              setIndex(0);
              setFullscreen(false);
            }}
            aria-pressed={filter === c}
            className={cn(
              "rounded-card border px-4 py-2 text-small font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red",
              filter === c
                ? "border-sk-red bg-sk-red-muted text-fg"
                : "border-ink-700 text-fg-muted hover:border-fg-subtle hover:text-fg",
            )}
          >
            {filterLabel(c)}
          </button>
        ))}
      </div>

      {count === 0 || !current ? (
        /* Empty category — labelled, never a blank screen. */
        <div className="mt-8 rounded-card border border-ink-700 bg-ink-900 px-6 py-20 text-center">
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="mx-auto size-8 text-fg-subtle"
          >
            <path
              d="M4 7h3l2-2h6l2 2h3v12H4V7z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <circle
              cx="12"
              cy="13"
              r="3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <p className="mt-4 text-fg-muted">{t("empty")}</p>
        </div>
      ) : (
        <div className="mt-8">
          {/* Main stage */}
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label={t("title")}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            className="relative aspect-[16/10] touch-pan-y select-none overflow-hidden rounded-card border border-ink-700 bg-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red"
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={current.id}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="absolute inset-0"
              >
                {current.kind === "image" ? (
                  <button
                    type="button"
                    onClick={() => setFullscreen(true)}
                    aria-label={t("viewer.openFull")}
                    className="absolute inset-0 cursor-zoom-in"
                  >
                    <Image
                      src={current.src}
                      alt={t(`items.${current.id}.alt`)}
                      fill
                      priority
                      sizes="(min-width: 1280px) 1100px, 100vw"
                      className="object-contain"
                      draggable={false}
                    />
                  </button>
                ) : (
                  <video
                    src={current.src}
                    controls
                    muted
                    loop
                    autoPlay
                    playsInline
                    className="absolute inset-0 size-full object-contain"
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Prev / next — overlay so 390px keeps the full stage width.
                Logical start/end: "next" sits at the end side, which is
                LEFT in RTL — the direction of travel, not just the icon. */}
            {count > 1 && (
              <>
                <StageArrow side="start" label={t("lightbox.prev")} onClick={() => step(-1)} />
                <StageArrow side="end" label={t("lightbox.next")} onClick={() => step(1)} />
              </>
            )}

            <span
              dir="ltr"
              className="absolute bottom-2 end-2 rounded-card bg-ink-950/80 px-2 py-1 text-eyebrow text-fg"
            >
              {index + 1}/{count}
            </span>
          </div>

          {/* Preload only the immediate neighbours. */}
          <div className="hidden" aria-hidden>
            {neighbours.map((n) => (
              <Image
                key={n.id}
                src={n.src}
                alt=""
                width={n.width}
                height={n.height}
                loading="eager"
                sizes="(min-width: 1280px) 1100px, 100vw"
              />
            ))}
          </div>

          {/* Thumbnail strip */}
          <div
            ref={stripRef}
            role="group"
            aria-label={t("viewer.thumbnails")}
            className="mt-3 flex gap-2 overflow-x-auto pb-2"
          >
            {filtered.map((item, i) => (
              <button
                key={item.id}
                type="button"
                data-thumb={item.id}
                onClick={() => setIndex(i)}
                aria-label={t(`items.${item.id}.alt`)}
                aria-current={i === index}
                className={cn(
                  "relative aspect-video w-24 shrink-0 overflow-hidden rounded-card border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red",
                  i === index
                    ? "border-sk-red ring-1 ring-sk-red"
                    : "border-ink-700 opacity-70 hover:opacity-100",
                )}
              >
                {item.kind === "image" ? (
                  <Image
                    src={item.src}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                    draggable={false}
                  />
                ) : (
                  <VideoThumb item={item} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen */}
      <Lightbox
        open={fullscreen && current !== undefined}
        onClose={() => setFullscreen(false)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        labels={{
          close: t("lightbox.close"),
          prev: t("lightbox.prev"),
          next: t("lightbox.next"),
        }}
      >
        {current && (
          <figure className="rounded-card border border-ink-700 bg-ink-900 p-2">
            {current.kind === "image" ? (
              <Image
                src={current.src}
                alt={t(`items.${current.id}.alt`)}
                width={current.width}
                height={current.height}
                sizes="(min-width: 1024px) 70vw, 95vw"
                className="max-h-[80svh] w-auto max-w-[90vw] rounded-[2px] object-contain"
              />
            ) : (
              <video
                src={current.src}
                controls
                autoPlay
                muted
                playsInline
                className="max-h-[80svh] w-auto max-w-[90vw] rounded-[2px]"
              />
            )}
            <figcaption className="p-3 text-small text-fg-muted">
              {t(`items.${current.id}.alt`)}
              <span dir="ltr" className="ms-2 text-fg-subtle">
                {index + 1}/{count}
              </span>
            </figcaption>
          </figure>
        )}
      </Lightbox>
    </div>
  );
}

function StageArrow({
  side,
  label,
  onClick,
}: {
  side: "start" | "end";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 rounded-card border border-ink-700 bg-ink-950/70 p-2 text-fg backdrop-blur-sm transition-colors hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red",
        side === "start" ? "start-2" : "end-2",
      )}
    >
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        className={cn("size-5", side === "start" ? "rtl:rotate-180" : "ltr:rotate-180")}
      >
        <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </button>
  );
}

function VideoThumb({ item }: { item: Extract<GalleryItem, { kind: "video" }> }) {
  return (
    <span className="absolute inset-0">
      <video
        src={item.srcMobile ?? item.src}
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 size-full object-cover"
      />
      <span className="absolute inset-0 grid place-items-center">
        <svg aria-hidden viewBox="0 0 16 16" className="size-5 fill-fg">
          <path d="M5 3l8 5-8 5V3z" />
        </svg>
      </span>
    </span>
  );
}
