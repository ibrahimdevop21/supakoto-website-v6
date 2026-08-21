"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  galleryCategories,
  galleryItems,
  type GalleryCategory,
  type GalleryItem,
} from "@/content/gallery";
import { Lightbox } from "@/components/ui/Lightbox";
import { RevealStagger, RevealItem } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * One ratio for every tile, photo or video — mixed per-image ratios made
 * the grid ragged (Hussein, 2026-08-21). 16:9 is Ibrahim's call: car
 * photography is shot wide. Images cover the box; the lightbox shows the
 * full frame. Change the ratio here and nowhere else.
 */
const TILE_ASPECT = "aspect-video";

export function GalleryGrid() {
  const t = useTranslations("gallery");
  const tServices = useTranslations("services.items");
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered =
    filter === "all"
      ? galleryItems
      : galleryItems.filter((i) => i.category === filter);

  const filterLabel = (c: GalleryCategory | "all") =>
    c === "all" || c === "video" ? t(`filters.${c}`) : tServices(`${c}.name`);

  const step = (delta: number) => {
    setOpenIndex((current) => {
      if (current === null) return current;
      return (current + delta + filtered.length) % filtered.length;
    });
  };

  const open = openIndex !== null ? filtered[openIndex] : null;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-2" role="group">
        {galleryCategories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setFilter(c);
              setOpenIndex(null);
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

      {/* Grid */}
      <RevealStagger
        key={filter}
        className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3"
      >
        {filtered.map((item, i) => (
          <RevealItem key={item.id}>
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              aria-label={t(`items.${item.id}.alt`)}
              className={cn(
                "relative block w-full overflow-hidden rounded-card border border-ink-700 transition-colors hover:border-fg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sk-red",
                TILE_ASPECT,
              )}
            >
              {item.kind === "image" ? (
                <Image
                  src={item.src}
                  alt={t(`items.${item.id}.alt`)}
                  fill
                  sizes="(min-width: 768px) 33vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <VideoTile item={item} label={t(`filters.video`)} />
              )}
            </button>
          </RevealItem>
        ))}
      </RevealStagger>

      {/* Lightbox */}
      <Lightbox
        open={open !== null}
        onClose={() => setOpenIndex(null)}
        onPrev={() => step(-1)}
        onNext={() => step(1)}
        labels={{
          close: t("lightbox.close"),
          prev: t("lightbox.prev"),
          next: t("lightbox.next"),
        }}
      >
        {open && (
          <figure className="rounded-card border border-ink-700 bg-ink-900 p-2">
            {open.kind === "image" ? (
              <Image
                src={open.src}
                alt={t(`items.${open.id}.alt`)}
                width={open.width}
                height={open.height}
                sizes="(min-width: 1024px) 70vw, 95vw"
                className="max-h-[80svh] w-auto max-w-[90vw] rounded-[2px] object-contain"
              />
            ) : (
              <video
                src={open.src}
                controls
                autoPlay
                muted
                playsInline
                className="max-h-[80svh] w-auto max-w-[90vw] rounded-[2px]"
              />
            )}
            <figcaption className="p-3 text-small text-fg-muted">
              {t(`items.${open.id}.alt`)}
              <span dir="ltr" className="ms-2 text-fg-subtle">
                {(openIndex ?? 0) + 1}/{filtered.length}
              </span>
            </figcaption>
          </figure>
        )}
      </Lightbox>
    </div>
  );
}

function VideoTile({
  item,
  label,
}: {
  item: Extract<GalleryItem, { kind: "video" }>;
  label: string;
}) {
  return (
    <span className="absolute inset-0">
      <video
        src={item.srcMobile ?? item.src}
        muted
        loop
        playsInline
        autoPlay
        className="absolute inset-0 size-full object-cover"
      />
      <span className="absolute bottom-2 start-2 flex items-center gap-1.5 rounded-card bg-ink-950/80 px-2 py-1 text-eyebrow text-fg">
        <svg aria-hidden viewBox="0 0 16 16" className="size-3 fill-current">
          <path d="M5 3l8 5-8 5V3z" />
        </svg>
        {label}
      </span>
    </span>
  );
}
